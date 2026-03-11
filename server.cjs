const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// API endpoint to run Nuclei scans
app.post('/api/nuclei-scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    // Build the Nuclei command based on options
    let cmd = `nuclei -u ${target}`;

    // Scan type
    if (options.scanType === 'vulnerability') {
        cmd += ' -t vulnerabilities/';
    } else if (options.scanType === 'exposure') {
        cmd += ' -t exposures/';
    } else if (options.scanType === 'misconfiguration') {
        cmd += ' -t misconfiguration/';
    } else if (options.scanType === 'custom') {
        // Custom scan options
        if (options.templates) cmd += ` -t ${options.templates}`;
        if (options.severity) cmd += ` -severity ${options.severity}`;
        if (options.excludeId) cmd += ` -exclude-id ${options.excludeId}`;
        if (options.rateLimit) cmd += ` -rate-limit ${options.rateLimit}`;
        if (options.concurrency) cmd += ` -concurrency ${options.concurrency}`;
        if (options.customArgs) cmd += ` ${options.customArgs}`;
    } else {
        // Quick scan - use default templates
        cmd += ' -t /home/user/.local/nuclei-templates';
    }

    console.log(`Running Nuclei scan: ${cmd}`);

    // For now, return immediately with a placeholder
    // In a production app, you'd want to run this asynchronously
    const output = `Nuclei scan started for ${target}. Scan command: ${cmd}\nNote: Full Nuclei scans can take several minutes. In a production environment, this would run asynchronously.`;
    
    res.json({
        success: true,
        command: cmd,
        output: output,
        findings: [],
        timestamp: new Date().toISOString()
    });
});

// Parse Nuclei output to extract findings
function parseNucleiOutput(output) {
    const findings = [];
    const lines = output.split('\n');

    for (const line of lines) {
        // Detect finding lines (typically in format: [severity] template-id: finding-name)
        const findingMatch = line.match(/\[(\w+)\]\s+(\S+):\s*(.+)/);
        if (findingMatch) {
            findings.push({
                severity: findingMatch[1],
                templateID: findingMatch[2],
                name: findingMatch[3],
                type: 'vulnerability'
            });
        }
    }

    return findings;
}

// API endpoint to run Nmap scans
app.post('/api/scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    // Build the Nmap command based on options
    let cmd = 'nmap';

    if (options.scanType === 'quick') {
        cmd += ' -T4 -F';
    } else if (options.scanType === 'comprehensive') {
        cmd += ' -sS -sV -sC -O -A';
    } else if (options.scanType === 'stealth') {
        cmd += ' -sS -sN -sF -sX';
    } else if (options.scanType === 'aggressive') {
        cmd += ' -A -T4';
    } else {
        // Custom scan
        if (options.speed) cmd += ` -T${options.speed}`;
        if (options.ports) cmd += ` -p ${options.ports}`;
        if (options.osDetection) cmd += ' -O';
        if (options.versionDetection) cmd += ' -sV';
        if (options.scriptScan) cmd += ' -sC';
        if (options.customArgs) cmd += ` ${options.customArgs}`;
    }

    cmd += ` ${target}`;

    console.log(`Running scan: ${cmd}`);

    exec(cmd, (error, stdout, stderr) => {
        if (error && stderr && !stderr.includes('WARNING') && !stderr.includes('Note')) {
            console.error('Nmap error:', stderr);
            return res.status(500).json({ error: stderr });
        }

        // Parse the output
        const output = stdout || stderr;
        const hosts = parseNmapOutput(output);

        res.json({
            success: true,
            command: cmd,
            output: output,
            hosts: hosts,
            timestamp: new Date().toISOString()
        });
    });
});

// Parse Nmap output to extract host information
function parseNmapOutput(output) {
    const hosts = [];
    const lines = output.split('\n');
    let currentHost = null;

    for (const line of lines) {
        // Detect host line
        const hostMatch = line.match(/Nmap scan report for (.+)/);
        if (hostMatch) {
            if (currentHost) hosts.push(currentHost);
            currentHost = {
                ip: hostMatch[1],
                ports: [],
            };
            continue;
        }

        // Detect port line
        const portMatch = line.match(/(\d+)\/(\w+)\s+(\w+)\s+(.+)/);
        if (portMatch && currentHost) {
            const port = {
                port: parseInt(portMatch[1]),
                protocol: portMatch[2],
                state: portMatch[3],
                service: portMatch[4],
            };
            currentHost.ports.push(port);
            continue;
        }

        // Detect OS line
        const osMatch = line.match(/OS details?: (.+)/);
        if (osMatch && currentHost) {
            currentHost.os = osMatch[1];
        }
    }

    if (currentHost) hosts.push(currentHost);
    return hosts;
}

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
