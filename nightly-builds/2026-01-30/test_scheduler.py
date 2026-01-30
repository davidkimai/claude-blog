# test_scheduler.py
import json
import argparse
from collections import Counter
from datetime import datetime
from unittest.mock import patch
from zoneinfo import ZoneInfo

import pytest

from scheduler import (
    build_productivity_histogram,
    generate_report,
    get_peak_hours,
    main,
    parse_log_file,
)

# Use a fixed sample log content for predictable test results
SAMPLE_LOG_CONTENT = """2026-01-28T10:15:00Z
2026-01-28T10:30:00Z
2026-01-28T11:05:00Z
INVALID_LINE

2026-01-28T14:00:00Z
2026-01-28T14:05:00Z
2026-01-28T14:10:00Z
2026-01-28T22:00:00Z
"""

@pytest.fixture
def sample_log_file(tmp_path):
    """A pytest fixture to create a temporary sample log file."""
    log_file = tmp_path / "test_log.txt"
    log_file.write_text(SAMPLE_LOG_CONTENT)
    return str(log_file)

def test_parse_log_file(sample_log_file):
    """Tests parsing of a log file with valid and invalid entries."""
    timestamps = parse_log_file(sample_log_file)
    assert len(timestamps) == 7
    # Check if a known timestamp is correctly parsed
    # dateutil.parser creates its own UTC object, so we compare values
    expected_ts = datetime(2026, 1, 28, 10, 15, tzinfo=ZoneInfo("UTC"))
    assert any(ts.year == expected_ts.year and ts.month == expected_ts.month and ts.day == expected_ts.day and ts.hour == expected_ts.hour and ts.minute == expected_ts.minute and ts.tzinfo is not None for ts in timestamps)


def test_parse_log_file_not_found():
    """Tests behavior when the log file does not exist."""
    timestamps = parse_log_file("non_existent_file.log")
    assert timestamps == []

def test_build_productivity_histogram():
    """Tests the creation of a productivity histogram from timestamps."""
    timestamps = [
        datetime(2026, 1, 1, 8, 0, tzinfo=ZoneInfo("UTC")),
        datetime(2026, 1, 1, 8, 30, tzinfo=ZoneInfo("UTC")),
        datetime(2026, 1, 1, 10, 0, tzinfo=ZoneInfo("UTC")),
        datetime(2026, 1, 2, 8, 0, tzinfo=ZoneInfo("UTC")),
    ]
    histogram = build_productivity_histogram(timestamps)
    expected_histogram = Counter({8: 3, 10: 1})
    assert histogram == expected_histogram

def test_get_peak_hours():
    """Tests identification of peak hours from a histogram."""
    histogram = Counter({14: 5, 10: 4, 22: 2, 9: 1})
    peak_hours = get_peak_hours(histogram, top_n=2)
    assert peak_hours == [14, 10]
    peak_hours_all = get_peak_hours(histogram, top_n=4)
    assert peak_hours_all == [14, 10, 22, 9]

def test_generate_report_utc_only(sample_log_file):
    """Tests report generation without a target timezone."""
    timestamps = parse_log_file(sample_log_file)
    histogram = build_productivity_histogram(timestamps)
    peak_hours = get_peak_hours(histogram, top_n=2)
    
    report = generate_report(
        log_file=sample_log_file,
        timestamps=timestamps,
        histogram=histogram,
        peak_hours_utc=peak_hours,
        target_timezone=None,
    )

    assert report["metadata"]["total_log_entries"] == 7
    assert report["analysis"]["productivity_histogram_utc"]["10"] == 2
    assert report["analysis"]["productivity_histogram_utc"]["14"] == 3
    assert sorted(report["recommendations"]["peak_hours_utc"]) == sorted([14, 10])
    assert "target_timezone" not in report["recommendations"]

def test_generate_report_with_timezone(sample_log_file):
    """Tests report generation with a valid target timezone."""
    timestamps = parse_log_file(sample_log_file)
    histogram = build_productivity_histogram(timestamps)
    peak_hours = get_peak_hours(histogram, top_n=2) # [14, 10] in UTC
    
    report = generate_report(
        log_file=sample_log_file,
        timestamps=timestamps,
        histogram=histogram,
        peak_hours_utc=peak_hours,
        target_timezone="America/New_York", # UTC-5 for Jan 2026
    )
    
    # 14:00 UTC -> 09:00 EST, 10:00 UTC -> 05:00 EST
    assert report["recommendations"]["target_timezone"] == "America/New_York"
    assert sorted(report["recommendations"]["peak_hours_local"]) == [5, 9]

def test_generate_report_with_invalid_timezone(sample_log_file):
    """Tests report generation with an invalid timezone."""
    timestamps = parse_log_file(sample_log_file)
    histogram = build_productivity_histogram(timestamps)
    peak_hours = get_peak_hours(histogram, top_n=2)
    
    report = generate_report(
        log_file=sample_log_file,
        timestamps=timestamps,
        histogram=histogram,
        peak_hours_utc=peak_hours,
        target_timezone="Invalid/Timezone",
    )
    
    assert "timezone_error" in report["recommendations"]
    assert "peak_hours_local" not in report["recommendations"]

@patch("argparse.ArgumentParser.parse_args")
def test_main_function(mock_parse_args, sample_log_file, capsys):
    """Tests the main function's orchestration and JSON output."""
    mock_parse_args.return_value = argparse.Namespace(
        log_file=sample_log_file,
        timezone="America/Los_Angeles",
        top_n=2
    )
    
    main()
    
    captured = capsys.readouterr()
    output = json.loads(captured.out)
    
    assert output["metadata"]["log_file_analyzed"] == sample_log_file
    assert output["recommendations"]["target_timezone"] == "America/Los_Angeles"
    assert sorted(output["recommendations"]["peak_hours_utc"]) == sorted([14, 10])
    # 14:00 UTC -> 06:00 PST, 10:00 UTC -> 02:00 PST for Jan 2026
    assert sorted(output["recommendations"]["peak_hours_local"]) == [2, 6]
