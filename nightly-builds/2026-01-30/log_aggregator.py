import os
import glob
from flask import Flask, render_template

# This script is intended to be run from the root of the 'clawd' project directory.
# All paths are constructed relative to the current working directory.

app = Flask(__name__)

# Define the log directory relative to the current working directory.
# Claude's logs are expected to be in '.claude/logs/'.
LOG_DIR = os.path.join(os.getcwd(), '.claude/logs')

def get_log_files():
    """
    Finds all .log files in the .claude/logs directory and its subdirectories.
    The files are sorted by modification time in descending order (newest first).

    Returns:
        list: A list of file paths for all found log files.
              Returns an empty list if the directory doesn't exist or no logs are found.
    """
    if not os.path.isdir(LOG_DIR):
        print(f"Error: Log directory not found at '{LOG_DIR}'")
        return []
    
    try:
        # Use a recursive glob pattern to find all .log files.
        path_pattern = os.path.join(LOG_DIR, '**/*.log')
        log_files = glob.glob(path_pattern, recursive=True)
        
        # Sort files by modification time, ensuring the most recent logs appear first.
        log_files.sort(key=os.path.getmtime, reverse=True)
        return log_files
    except Exception as e:
        print(f"Error scanning for log files in '{LOG_DIR}': {e}")
        return []

def read_logs_from_files(file_paths):
    """
    Reads content from a list of log files and formats it for display.
    Each block of log content is prefixed with its relative file path as a header.

    Args:
        file_paths (list): A list of paths to the log files to be read.

    Returns:
        str: A single string containing the formatted content of all logs.
    """
    aggregated_content = []
    for file_path in file_paths:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                # Use a relative path from the LOG_DIR for a cleaner, more readable header.
                relative_path = os.path.relpath(file_path, LOG_DIR)
                header = f"--- Log File: {relative_path} ---\n"
                content = f.read()
                # Separate log files with a clear boundary.
                aggregated_content.append(header + content + "\n\n========================================\n\n")
        except IOError as e:
            # If a file cannot be read, record the error and continue.
            error_message = f"--- Error reading file: {file_path} ---\n{e}\n\n"
            aggregated_content.append(error_message)
            print(f"Warning: Could not read log file '{file_path}': {e}")
    
    if not aggregated_content:
        return "No log files were found or they are all empty."

    return "".join(aggregated_content)

@app.route('/')
def log_dashboard():
    """
    The main Flask route that serves the log dashboard.
    It orchestrates finding, reading, and rendering the logs.
    """
    try:
        log_files = get_log_files()
        log_content = read_logs_from_files(log_files)
        return render_template('log_dashboard.html', logs=log_content)
    except Exception as e:
        # A fallback for any unexpected errors during request processing.
        error_message = f"An unexpected error occurred while generating the log dashboard: {e}"
        print(error_message)
        # Render the error within the template for visibility.
        return render_template('log_dashboard.html', logs=error_message), 500

if __name__ == '__main__':
    """
    Entry point for the Flask application.
    Starts the web server.
    """
    print("Starting Claude Log Aggregator server...")
    print("Access the dashboard at http://localhost:5001")
    # Using debug=False for a production-like environment.
    # The server is accessible from any machine on the network.
    app.run(host='0.0.0.0', port=5001, debug=False)

