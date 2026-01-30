# -*- coding: utf-8 -*-
"""
ContextAnalyzer: A tool for ingesting and analyzing conversation text.

This script processes conversational text to extract key entities, topics, and
actionable statements. It assigns a priority score to each extracted piece of
information, suggesting what is most critical to commit to long-term memory.

The output is a JSON object that can be easily parsed by other tools or agents.
"""

import argparse
import json
import sys
import spacy
from spacy.cli.download import download as spacy_download

class ContextAnalyzer:
    """
    Analyzes text to extract and prioritize information for memory commitment.
    """

    def __init__(self, model_name="en_core_web_sm"):
        """
        Initializes the ContextAnalyzer and loads the spaCy model.

        Args:
            model_name (str): The name of the spaCy model to use.
        """
        self.model_name = model_name
        try:
            self.nlp = spacy.load(self.model_name)
        except OSError:
            print(
                f"spaCy model '{self.model_name}' not found. "
                f"Attempting to download it...",
                file=sys.stderr
            )
            try:
                spacy_download(self.model_name)
                self.nlp = spacy.load(self.model_name)
            except Exception as e:
                print(
                    f"Failed to download spaCy model '{self.model_name}'. "
                    f"Please run 'python -m spacy download {self.model_name}' "
                    f"manually. Error: {e}",
                    file=sys.stderr
                )
                sys.exit(1)

    def _assign_priority(self, info_type, text, entities_in_sentence):
        """
        Assigns a priority score based on the type and content of the information.

        Args:
            info_type (str): The type of information (e.g., 'action', 'preference').
            text (str): The text content of the information.
            entities_in_sentence (list): A list of entity types (e.g., ['DATE'])
                                         present in the source sentence.

        Returns:
            int: A priority score from 1 (lowest) to 10 (highest).
        """
        text_lower = text.lower()
        score = 5  # Base score

        if info_type == 'action':
            score = 8
            if any(e in ['DATE', 'TIME'] for e in entities_in_sentence):
                score = 10  # Highest priority for timed actions
            elif 'schedule' in text_lower or 'remind' in text_lower:
                score = 9
        elif info_type == 'preference':
            score = 9
        elif info_type == 'entity':
            if any(e in ['PERSON', 'ORG'] for e in entities_in_sentence):
                score = 7
            else:
                score = 6
        elif info_type == 'topic':
            score = 4

        return score

    def analyze(self, text):
        """
        Processes the input text and extracts prioritized information.

        Args:
            text (str): The conversational text to analyze.

        Returns:
            list: A list of dictionaries, where each dictionary represents a
                  piece of extracted information.
        """
        if not text:
            return []

        doc = self.nlp(text)
        insights = []
        processed_sentences = set()

        for sent in doc.sents:
            sentence_text = sent.text.strip()
            if not sentence_text or sentence_text in processed_sentences:
                continue
            
            processed_sentences.add(sentence_text)
            sentence_entities = [ent.label_ for ent in sent.ents]

            # 1. Extract Actionable Statements
            root = sent.root
            if root.pos_ == 'VERB' and (root.morph.get('VerbForm') == ['Fin'] or root.tag_ == 'VB'):
                is_command = root.i == sent.start or (root.i > sent.start and doc[root.i - 1].pos_ in ['AUX', 'PART'])
                if is_command and not any(subj in [tok.dep_ for tok in root.children] for subj in ['nsubj', 'nsubjpass']):
                     insight = {
                        "type": "action",
                        "content": sentence_text,
                        "priority": self._assign_priority('action', sentence_text, sentence_entities),
                        "source_sentence": sentence_text,
                        "metadata": {"verb": root.lemma_}
                    }
                     insights.append(insight)
                     continue # Prioritize action over other types for a sentence

            # 2. Extract Preferences and Facts
            if "my " in sentence_text.lower() or "i prefer" in sentence_text.lower() or "remember that" in sentence_text.lower():
                insight = {
                    "type": "preference",
                    "content": sentence_text,
                    "priority": self._assign_priority('preference', sentence_text, sentence_entities),
                    "source_sentence": sentence_text,
                    "metadata": {}
                }
                insights.append(insight)
                continue

            # 3. Extract Entities
            if sent.ents:
                for ent in sent.ents:
                    insight = {
                        "type": "entity",
                        "content": ent.text,
                        "priority": self._assign_priority('entity', ent.text, [ent.label_]),
                        "source_sentence": sentence_text,
                        "metadata": {"label": ent.label_}
                    }
                    insights.append(insight)

            # 4. Extract Topics from Noun Chunks
            if not sent.ents and not sent.root.pos_ == 'VERB': # Avoid redundancy
                for chunk in sent.noun_chunks:
                    # Filter out pronouns and very short chunks
                    if chunk.root.pos_ != 'PRON' and len(chunk.text) > 3:
                        insight = {
                            "type": "topic",
                            "content": chunk.text,
                            "priority": self._assign_priority('topic', chunk.text, []),
                            "source_sentence": sentence_text,
                            "metadata": {"root_pos": chunk.root.pos_}
                        }
                        insights.append(insight)
        
        # Sort by priority, descending
        insights.sort(key=lambda x: x['priority'], reverse=True)
        return insights


def main():
    """
    Main function to run the ContextAnalyzer from the command line.
    """
    parser = argparse.ArgumentParser(
        description="Analyzes conversation text to extract key information.",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument(
        "input_file",
        help="Path to the text file containing the conversation context."
    )
    parser.add_argument(
        "--output-format",
        choices=['json'],
        default='json',
        help="The output format for the analysis results."
    )
    parser.add_argument(
        "--model",
        default="en_core_web_sm",
        help="The spaCy model to use for analysis."
    )

    if len(sys.argv) == 1:
        parser.print_help(sys.stderr)
        sys.exit(1)

    args = parser.parse_args()

    try:
        with open(args.input_file, 'r', encoding='utf-8') as f:
            context_text = f.read()
    except FileNotFoundError:
        print(f"Error: Input file not found at '{args.input_file}'", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file: {e}", file=sys.stderr)
        sys.exit(1)

    analyzer = ContextAnalyzer(model_name=args.model)
    analysis_results = analyzer.analyze(context_text)

    if args.output_format == 'json':
        output = {"insights": analysis_results}
        print(json.dumps(output, indent=2))
    else:
        # In case other formats are added later
        print("Error: Unsupported output format.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
