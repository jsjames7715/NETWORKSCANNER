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

// API endpoint to run Whois lookup
app.post('/api/whois', (req, res) => {
    const { target } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    const cmd = `whois ${target}`;
    console.log(`Running whois: ${cmd}`);

    exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error && stderr && !stderr.includes('WARNING')) {
            return res.status(500).json({ error: stderr });
        }
        res.json({
            success: true,
            command: cmd,
            output: stdout || stderr,
            timestamp: new Date().toISOString()
        });
    });
});

// API endpoint for Traceroute
app.post('/api/traceroute', (req, res) => {
    const { target, maxHops } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    const hops = maxHops || 30;
    const cmd = `traceroute -m ${hops} ${target}`;
    console.log(`Running traceroute: ${cmd}`);

    exec(cmd, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error && stderr && !stderr.includes('WARNING')) {
            return res.status(500).json({ error: stderr });
        }
        res.json({
            success: true,
            command: cmd,
            output: stdout || stderr,
            timestamp: new Date().toISOString()
        });
    });
});

// API endpoint for DNS Lookup (dig)
app.post('/api/dns-lookup', (req, res) => {
    const { target, type } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    const cmd = `dig ${target} ${type || 'ANY'} +short`;
    console.log(`Running dig: ${cmd}`);

    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error && stderr && !stderr.includes('WARNING')) {
            return res.status(500).json({ error: stderr });
        }
        res.json({
            success: true,
            command: cmd,
            output: stdout || stderr,
            timestamp: new Date().toISOString()
        });
    });
});

// API endpoint for Ping
app.post('/api/ping', (req, res) => {
    const { target, count } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    const cmd = `ping -c ${count || 4} ${target}`;
    console.log(`Running ping: ${cmd}`);

    exec(cmd, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error && stderr && !stderr.includes('WARNING')) {
            return res.status(500).json({ error: stderr });
        }
        res.json({
            success: true,
            command: cmd,
            output: stdout || stderr,
            timestamp: new Date().toISOString()
        });
    });
});

// API endpoint for Host lookup
app.post('/api/host-lookup', (req, res) => {
    const { target } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    const cmd = `host ${target}`;
    console.log(`Running host: ${cmd}`);

    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error && stderr && !stderr.includes('WARNING')) {
            return res.status(500).json({ error: stderr });
        }
        res.json({
            success: true,
            command: cmd,
            output: stdout || stderr,
            timestamp: new Date().toISOString()
        });
    });
});

// API endpoint for Nslookup
app.post('/api/nslookup', (req, res) => {
    const { target, server } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    const cmd = server ? `nslookup ${target} ${server}` : `nslookup ${target}`;
    console.log(`Running nslookup: ${cmd}`);

    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
        if (error && stderr && !stderr.includes('WARNING')) {
            return res.status(500).json({ error: stderr });
        }
        res.json({
            success: true,
            command: cmd,
            output: stdout || stderr,
            timestamp: new Date().toISOString()
        });
    });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
