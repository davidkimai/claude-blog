# -*- coding: utf-8 -*-
"""
Unit tests for the skill-matrix tool.

This test suite verifies the core functionality of skill_matrix.py, including
skill discovery, log parsing, and data aggregation. It uses mock file systems
and log data to ensure predictable and isolated testing.
"""

import os
import json
import unittest
import tempfile
from collections import Counter
from unittest.mock import patch, MagicMock

# Assuming skill_matrix.py is in the same directory or accessible via PYTHONPATH
import skill_matrix

class TestSkillMatrix(unittest.TestCase):
    """Test suite for skill-matrix functionality."""

    def setUp(self):
        """Set up a temporary directory for test files."""
        self.test_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        """Clean up the temporary directory."""
        self.test_dir.cleanup()

    def _create_temp_file(self, dir_path, filename, content=""):
        """Helper to create a file in the temp directory."""
        file_path = os.path.join(dir_path, filename)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return file_path

    def test_get_available_skills(self):
        """Test discovery of skills from a directory."""
        skills_path = os.path.join(self.test_dir.name, "skills")
        os.makedirs(skills_path)
        
        # Create dummy skill files
        self._create_temp_file(skills_path, "skill_one.py")
        self._create_temp_file(skills_path, "skill_two.md")
        self._create_temp_file(skills_path, "another_skill.json")
        
        # Create a subdirectory, which should be ignored
        os.makedirs(os.path.join(skills_path, "subdir"))
        self._create_temp_file(os.path.join(skills_path, "subdir"), "ignored_skill.py")
        
        expected_skills = {"skill_one", "skill_two", "another_skill"}
        result_skills = skill_matrix.get_available_skills(skills_path)
        
        self.assertEqual(result_skills, expected_skills)

    def test_get_available_skills_no_directory(self):
        """Test behavior when the skills directory does not exist."""
        non_existent_path = os.path.join(self.test_dir.name, "non_existent")
        result_skills = skill_matrix.get_available_skills(non_existent_path)
        self.assertEqual(result_skills, set())

    def test_analyze_log_file(self):
        """Test parsing of a single log file for skill usage."""
        log_content = [
            json.dumps({"event": "tool_code", "tool_name": "skill_one"}),
            "this is not a json line",
            json.dumps({"event": "some_other_event", "tool_name": "skill_two"}),
            json.dumps({"event": "tool_code", "tool_name": "skill_one"}),
            json.dumps({"event": "tool_code", "tool_name": "skill_three"}),
            json.dumps({"event": "tool_code", "other_data": "no tool name here"}),
        ]
        log_path = self._create_temp_file(self.test_dir.name, "test.log", "\n".join(log_content))

        expected_counts = Counter({"skill_one": 2, "skill_three": 1})
        result_counts = skill_matrix.analyze_log_file(log_path)

        self.assertEqual(result_counts, expected_counts)

    @patch('skill_matrix.analyze_log_file')
    @patch('glob.glob')
    @patch('os.path.getmtime')
    def test_get_skill_usage_data(self, mock_getmtime, mock_glob, mock_analyze):
        """Test aggregation of skill usage data across multiple log files."""
        logs_path = os.path.join(self.test_dir.name, "logs")
        os.makedirs(logs_path)

        # Mock log files
        log1_path = os.path.join(logs_path, "log1.log")
        log2_path = os.path.join(logs_path, "log2.log")
        log3_path_old = os.path.join(logs_path, "log3_old.log")
        mock_glob.return_value = [log1_path, log2_path, log3_path_old]
        
        from datetime import datetime, timedelta
        now = datetime.now()
        
        # Mock file modification times
        mock_getmtime.side_effect = [
            now.timestamp(),  # log1 is recent
            (now - timedelta(days=5)).timestamp(), # log2 is recent
            (now - timedelta(days=40)).timestamp(), # log3 is old
        ]

        # Mock parsed data from each log file
        mock_analyze.side_effect = [
            Counter({"skill_one": 5, "skill_two": 2}),  # from log1
            Counter({"skill_one": 3, "skill_three": 1}), # from log2
            Counter({"skill_one": 10, "skill_four": 1}), # from log3
        ]

        total_counts, recent_counts = skill_matrix.get_skill_usage_data(logs_path, days_ago=30)

        expected_total = Counter({
            "skill_one": 18, "skill_two": 2, "skill_three": 1, "skill_four": 1
        })
        expected_recent = Counter({
            "skill_one": 8, "skill_two": 2, "skill_three": 1
        })

        self.assertEqual(total_counts, expected_total)
        self.assertEqual(recent_counts, expected_recent)
        self.assertEqual(mock_analyze.call_count, 3)

    @patch('argparse.ArgumentParser')
    @patch('skill_matrix.get_available_skills')
    @patch('skill_matrix.get_skill_usage_data')
    @patch('skill_matrix.display_skill_matrix')
    def test_main_flow(self, mock_display, mock_get_usage, mock_get_skills, mock_argparser):
        """Test the main execution flow of the script."""
        # Mock argparse to return default values
        mock_args = MagicMock()
        mock_args.skills_dir = "skills/"
        mock_args.logs_dir = ".claude/logs/"
        mock_args.recency = 30
        mock_argparser.return_value.parse_args.return_value = mock_args

        # Mock data returned by core functions
        mock_skills = {"skill_a", "skill_b", "skill_c"}
        mock_get_skills.return_value = mock_skills
        
        mock_total = Counter({"skill_a": 10, "skill_b": 5})
        mock_recent = Counter({"skill_a": 2})
        mock_get_usage.return_value = (mock_total, mock_recent)

        # Run main
        skill_matrix.main()

        # Verify functions were called with correct arguments
        mock_get_skills.assert_called_once_with("skills/")
        mock_get_usage.assert_called_once_with(".claude/logs/", 30)
        mock_display.assert_called_once_with(mock_skills, mock_total, mock_recent)

    @patch('skill_matrix.Console')
    def test_display_skill_matrix(self, mock_console):
        """Test the table generation for display."""
        mock_instance = mock_console.return_value
        
        skills = {"active_skill", "recent_only_skill", "old_skill", "unused_skill"}
        total = Counter({"active_skill": 20, "recent_only_skill": 5, "old_skill": 10})
        recent = Counter({"active_skill": 5, "recent_only_skill": 5})

        skill_matrix.display_skill_matrix(skills, total, recent)
        
        # Check that a table was printed
        mock_instance.print.assert_any_call(unittest.mock.ANY) # For the table
        table_obj = mock_instance.print.call_args_list[0].args[0]
        
        self.assertIsInstance(table_obj, skill_matrix.Table)
        self.assertEqual(len(table_obj.rows), 4)

        # Check a specific row for correctness
        # Note: This is fragile and depends on implementation details of Rich Table
        # A better test might capture stdout and check the string output
        rendered_rows = [row.cells for row in table_obj.rows]
        
        # Sort rows by skill name as the function does
        rendered_rows.sort(key=lambda x: x[0])
        
        self.assertEqual(rendered_rows[0], ('active_skill', '20', '5', '[green]Actively Used[/green]'))
        self.assertEqual(rendered_rows[1], ('old_skill', '10', '0', '[yellow]Not Used Recently[/yellow]'))
        self.assertEqual(rendered_rows[2], ('recent_only_skill', '5', '5', '[green]Actively Used[/green]'))
        self.assertEqual(rendered_rows[3], ('unused_skill', '0', '0', '[red]Unused[/red]'))

if __name__ == '__main__':
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
