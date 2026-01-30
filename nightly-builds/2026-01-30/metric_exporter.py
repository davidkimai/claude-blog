```python
import http.server
import socketserver
import threading
import time
import os
from prometheus_client import start_http_server, Counter, Gauge, REGISTRY, CollectorRegistry

# --- Configuration ---
METRICS_PORT = 8000
UPDATE_FILE_PATH = "/Users/jasontang/.gemini/tmp/6a9bf1236c1b8989e4b87f35c6afe9f0940f6f5aba8f3048ff44bbdb458ae06e/metric_updates.txt"
PID_FILE = "/Users/jasontang/.gemini/tmp/6a9bf1236c1b8989e4b87f35c6afe9f0940f6f5aba8f3048ff44bbdb458ae06e/metric_exporter.pid"

# --- Metrics Definition ---
# Using a custom registry to avoid conflicts if other parts of the system use prometheus_client
registry = CollectorRegistry()

TASKS_COMPLETED = Counter('claude_tasks_completed_total', 'Total number of tasks completed successfully.', registry=registry)
ERRORS_ENCOUNTERED = Counter('claude_errors_encountered_total', 'Total number of errors encountered.', registry=registry)
API_CALLS_MADE = Counter('claude_api_calls_made_total', 'Total number of API calls made.', ['api_name'], registry=registry)
ACTIVE_TASKS = Gauge('claude_active_tasks', 'Number of tasks currently in progress.', registry=registry)

# --- File-based Metric Update Handler ---
def process_update_file():
    """
    Processes metric updates from the update file.
    Each line in the file should be in the format: <metric_name>:<value>[:<label_value>]
    For example:
    tasks_completed:1
    errors_encountered:1
    api_calls_made:1:some_api
    active_tasks:set:5 
    """
    if not os.path.exists(UPDATE_FILE_PATH):
        return

    # Read and process updates
    with open(UPDATE_FILE_PATH, 'r+') as f:
        lines = f.readlines()
        f.seek(0)
        f.truncate()

        for line in lines:
            line = line.strip()
            if not line:
                continue

            parts = line.split(':')
            metric_name = parts[0]
            
            try:
                if metric_name == 'tasks_completed':
                    TASKS_COMPLETED.inc(float(parts[1]))
                elif metric_name == 'errors_encountered':
                    ERRORS_ENCOUNTERED.inc(float(parts[1]))
                elif metric_name == 'api_calls_made':
                    if len(parts) >= 3:
                        API_CALLS_MADE.labels(api_name=parts[2]).inc(float(parts[1]))
                    else:
                        print(f"Warning: api_calls_made metric requires a label. Line: {line}")
                elif metric_name == 'active_tasks':
                    if len(parts) >= 2:
                        if parts[1] == 'inc':
                            ACTIVE_TASKS.inc()
                        elif parts[1] == 'dec':
                            ACTIVE_TASKS.dec()
                        elif parts[1] == 'set' and len(parts) >=3:
                             ACTIVE_TASKS.set(float(parts[2]))
                        else:
                            print(f"Warning: Invalid operation for active_tasks. Line: {line}")
                else:
                    print(f"Warning: Unknown metric name '{metric_name}' in update file.")
            except (ValueError, IndexError) as e:
                print(f"Error processing line '{line}': {e}")


def file_watcher_thread():
    """
    Watches the update file for changes and processes them.
    """
    while True:
        process_update_file()
        time.sleep(0.5) # Check for updates every 500ms


# --- Prometheus Metrics Server ---
class CustomMetricsHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        from prometheus_client.exposition import generate_latest
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
        self.end_headers()
        self.wfile.write(generate_latest(registry))

    def log_message(self, format, *args):
        # Quiet the logging
        return

def start_prometheus_server():
    """
    Starts the Prometheus metrics server in a separate thread.
    """
    httpd = socketserver.TCPServer(("", METRICS_PORT), CustomMetricsHandler)
    thread = threading.Thread(target=httpd.serve_forever)
    thread.daemon = True
    thread.start()
    print(f"Prometheus metrics exporter started on port {METRICS_PORT}")

# --- Main ---
if __name__ == '__main__':
    # Write PID to file
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))

    # Start the servers
    start_prometheus_server()

    # Start the file watcher
    watcher = threading.Thread(target=file_watcher_thread)
    watcher.daemon = True
    watcher.start()

    print("Claude Metric Exporter is running.")
    # Keep the main thread alive
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")
        os.remove(PID_FILE)
        os.remove(UPDATE_FILE_PATH)

```
