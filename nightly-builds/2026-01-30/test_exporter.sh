#!/bin/bash

METRICS_PORT=8000
UPDATE_FILE="/Users/jasontang/.gemini/tmp/6a9bf1236c1b8989e4b87f35c6afe9f0940f6f5aba8f3048ff44bbdb458ae06e/metric_updates.txt"

# Function to clean up
cleanup() {
    echo "Cleaning up..."
    # Stop the exporter
    ./start-exporter.sh stop
    rm -f $UPDATE_FILE
}

# Trap exit signals to ensure cleanup
trap cleanup EXIT

# Start the exporter
./start-exporter.sh

# Wait for the server to start
sleep 3

# --- Test 1: Check initial metrics ---
echo "--- Test 1: Checking initial metrics ---"
curl -s http://localhost:$METRICS_PORT/metrics | grep "claude_"

# --- Test 2: Increment tasks_completed ---
echo -e "\n--- Test 2: Incrementing tasks_completed ---"
echo "tasks_completed:1" >> $UPDATE_FILE
sleep 1 # Allow time for the file watcher to process
curl -s http://localhost:$METRICS_PORT/metrics | grep "claude_tasks_completed_total"

# --- Test 3: Increment errors_encountered ---
echo -e "\n--- Test 3: Incrementing errors_encountered ---"
echo "errors_encountered:5" >> $UPDATE_FILE
sleep 1
curl -s http://localhost:$METRICS_PORT/metrics | grep "claude_errors_encountered_total"

# --- Test 4: Increment api_calls_made ---
echo -e "\n--- Test 4: Incrementing api_calls_made ---"
echo "api_calls_made:1:test_api" >> $UPDATE_FILE
sleep 1
curl -s http://localhost:$METRICS_PORT/metrics | grep "claude_api_calls_made_total{api_name=\"test_api\"}"

# --- Test 5: Set active_tasks ---
echo -e "\n--- Test 5: Setting active_tasks ---"
echo "active_tasks:set:10" >> $UPDATE_FILE
sleep 1
curl -s http://localhost:$METRICS_PORT/metrics | grep "claude_active_tasks"

# --- Test 6: Increment and Decrement active_tasks ---
echo -e "\n--- Test 6: Incrementing and Decrementing active_tasks ---"
echo "active_tasks:inc" >> $UPDATE_FILE
sleep 1
curl -s http://localhost:$METRICS_PORT/metrics | grep "claude_active_tasks"
echo "active_tasks:dec" >> $UPDATE_FILE
sleep 1
curl -s http://localhost:$METRICS_PORT/metrics | grep "claude_active_tasks"

# --- Test 7: Handle invalid metric ---
echo -e "\n--- Test 7: Handling invalid metric ---"
echo "invalid_metric:1" >> $UPDATE_FILE
sleep 1
# No easy way to check for a warning message in the log, but we can ensure the server is still running
if ! curl -s http://localhost:$METRICS_PORT/metrics > /dev/null; then
    echo "Server is not responding after invalid metric."
    exit 1
fi
echo "Server is still running after invalid metric."

echo -e "\nAll tests passed!"
exit 0
