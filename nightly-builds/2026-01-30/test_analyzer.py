# -*- coding: utf-8 -*-
"""
Tests for the ContextAnalyzer tool.

This module contains a suite of tests for ContextAnalyzer using pytest.
It verifies that the tool correctly extracts entities, actions, and preferences,
assigns appropriate priorities, and produces a valid JSON output.
"""
import pytest
import json
from context_analyzer import ContextAnalyzer

# Use a fixture to initialize the analyzer once for all tests
@pytest.fixture(scope="module")
def analyzer():
    """Provides a ContextAnalyzer instance for testing."""
    # This may trigger a download on first run, which is expected.
    return ContextAnalyzer()

@pytest.fixture(scope="module")
def sample_text():
    """Provides the content of the sample context file."""
    with open("sample_context.txt", "r", encoding="utf-8") as f:
        return f.read()

def test_analyzer_initialization(analyzer):
    """Tests if the ContextAnalyzer initializes correctly."""
    assert analyzer is not None
    assert analyzer.nlp is not None

def test_analysis_of_sample_text(analyzer, sample_text):
    """Performs a full analysis and checks for basic validity."""
    results = analyzer.analyze(sample_text)
    assert isinstance(results, list)
    # Ensure there's some output from the sample text
    assert len(results) > 0

def test_json_output_format(analyzer, sample_text):
    """Tests if the output can be formatted as valid JSON."""
    results = analyzer.analyze(sample_text)
    output = {"insights": results}
    try:
        json_output = json.dumps(output)
        loaded_json = json.loads(json_output)
        assert loaded_json == output
    except (TypeError, json.JSONDecodeError) as e:
        pytest.fail(f"JSON serialization/deserialization failed: {e}")

def test_action_extraction(analyzer, sample_text):
    """Tests for correct identification of actionable statements."""
    results = analyzer.analyze(sample_text)
    action_insights = [r for r in results if r['type'] == 'action']
    assert len(action_insights) > 0

    # Specifically check for the meeting scheduling task
    schedule_action_found = any(
        "schedule a meeting" in insight['content'].lower()
        for insight in action_insights
    )
    assert schedule_action_found, "The 'schedule a meeting' action was not found."

    # Check that it has a high priority because of the date/time
    schedule_action = next(
        i for i in action_insights if "schedule a meeting" in i['content'].lower()
    )
    assert schedule_action['priority'] == 10

def test_preference_extraction(analyzer, sample_text):
    """Tests for correct identification of user preferences."""
    results = analyzer.analyze(sample_text)
    preference_insights = [r for r in results if r['type'] == 'preference']
    assert len(preference_insights) > 0

    # Check for the PDF format preference
    pdf_preference_found = any(
        "preferred format for reports is pdf" in insight['content'].lower()
        for insight in preference_insights
    )
    assert pdf_preference_found, "The PDF format preference was not found."

    # Check that it has a high priority
    pdf_preference = next(
        i for i in preference_insights if "preferred format" in i['content'].lower()
    )
    assert pdf_preference['priority'] == 9

def test_entity_extraction(analyzer, sample_text):
    """Tests for correct identification of named entities."""
    results = analyzer.analyze(sample_text)
    entity_insights = [r for r in results if r['type'] == 'entity']
    assert len(entity_insights) > 0

    # Check for specific entities
    entities_found = {insight['content'].lower() for insight in entity_insights}
    assert "john smith" in entities_found
    assert "q4 2025" in entities_found
    assert "next tuesday at 10 am" in entities_found
    
    # Check that a person has the right metadata
    john_smith_entity = next(
        i for i in entity_insights if i['content'].lower() == 'john smith'
    )
    assert john_smith_entity['metadata']['label'] == 'PERSON'

def test_priority_sorting(analyzer, sample_text):
    """Tests if the results are correctly sorted by priority."""
    results = analyzer.analyze(sample_text)
    priorities = [r['priority'] for r in results]
    # Check if the list is sorted in descending order
    assert priorities == sorted(priorities, reverse=True)

def test_empty_input(analyzer):
    """Tests that the analyzer handles empty string input gracefully."""
    results = analyzer.analyze("")
    assert results == []

if __name__ == "__main__":
    pytest.main()
