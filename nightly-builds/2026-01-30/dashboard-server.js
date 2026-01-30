const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// This is the Node.js server for the Claude Dashboard.
// It serves the static frontend files (HTML, CSS, JS) and provides an API
// endpoint to fetch the processed log data.
//
// To run this server:
// 1. Install dependencies: npm install express cors
// 2. Run the server: node dashboard-server.js
// 3. Open your browser to http://localhost:3000
//
// Before running, make sure to generate the data by running:
// node scripts/collect-dashboard-stats.js

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3000;
const DASHBOARD_DIR = path.join(__dirname, 'dashboard');
const DATA_FILE = path.join(DASHBOARD_DIR, 'data.json');

// --- SERVER SETUP ---
const app = express();

// --- MIDDLEWARE ---
// Enable Cross-Origin Resource Sharing for all routes
app.use(cors());

// Serve static files from the 'dashboard' directory
app.use(express.static(DASHBOARD_DIR));

// --- API ROUTES ---

/**
 * API Endpoint: /api/data
 * Reads the processed `data.json` file and sends it to the client.
 * Handles cases where the file might not exist.
 */
app.get('/api/data', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            // If the file doesn't exist, it's likely the collection script hasn't run.
            // Send a clear error message to the client.
            if (err.code === 'ENOENT') {
                console.error(`Data file not found at ${DATA_FILE}. Please run the collection script.`);
                return res.status(404).json({
                    error: 'Data file not found.',
                    message: 'Please run `node scripts/collect-dashboard-stats.js` to generate the data.',
                });
            }
            // For other file system errors, send a generic server error.
            console.error('Error reading data file:', err);
            return res.status(500).json({ error: 'Failed to read dashboard data.' });
        }

        try {
            // Parse the JSON data and send it.
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseErr) {
            console.error('Error parsing data file:', parseErr);
            res.status(500).json({ error: 'Failed to parse dashboard data.' });
        }
    });
});

// --- ROOT ROUTE ---

/**
 * Root Endpoint: /
 * Serves the main `index.html` file for the dashboard.
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(DASHBOARD_DIR, 'index.html'));
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Claude Dashboard server running on http://localhost:${PORT}`);
    console.log(`Serving files from: ${DASHBOARD_DIR}`);
    console.log(`Expecting data file at: ${DATA_FILE}`);
});
