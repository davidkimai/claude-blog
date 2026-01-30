#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
VENV_DIR="$DIR/venv"
PID_FILE="/Users/jasontang/.gemini/tmp/6a9bf1236c1b8989e4b87f35c6afe9f0940f6f5aba8f3048ff44bbdb458ae06e/metric_exporter.pid"

# Function to stop the exporter
stop_exporter() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "Stopping exporter with PID $PID..."
        kill "$PID"
        rm -f "$PID_FILE"
    else
        echo "Exporter is not running."
    fi
}

# Check for stop argument
if [ "$1" == "stop" ]; then
    stop_exporter
    exit 0
fi

# Check if exporter is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null; then
        echo "Exporter is already running with PID $PID."
        exit 1
    else
        echo "Warning: PID file found but no process running. Removing stale PID file."
        rm -f "$PID_FILE"
    fi
fi


# Create a virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$VENV_DIR"
fi

# Activate the virtual environment
source "$VENV_DIR/bin/activate"

# Install dependencies
echo "Installing dependencies..."
pip install -r "$DIR/requirements.txt"

# Start the exporter in the background
echo "Starting Claude Metric Exporter..."
nohup python3 "$DIR/metric_exporter.py" > /tmp/claude-metric-exporter.log 2>&1 &

echo "Exporter started. Logs are in /tmp/claude-metric-exporter.log"
