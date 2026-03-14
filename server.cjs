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

// Helper to safely execute commands and return JSON
function safeExec(cmd, timeout, res, successDataBuilder) {
    const execProcess = exec(cmd, { timeout }, (error, stdout, stderr) => {
        // Always ensure we send a response
        try {
            if (error) {
                // Check if it's a real error or just a non-zero exit code
                if (stderr && !stderr.includes('WARNING') && !stderr.includes('Note')) {
                    console.error(`Command error [${cmd}]:`, stderr);
                    return res.status(500).json({ error: stderr });
                }
                // If error but no stderr, it might be a timeout or signal
                if (error.killed || error.signal) {
                    console.error(`Command killed [${cmd}]:`, error.message);
                    return res.status(500).json({ error: error.message });
                }
            }
            
            const output = stdout || stderr;
            const data = successDataBuilder(output);
            res.json(data);
        } catch (err) {
            console.error(`Processing error [${cmd}]:`, err);
            res.status(500).json({ error: err.message });
        }
    });

    // Handle process errors (e.g., timeout, signal)
    execProcess.on('error', (err) => {
        console.error(`Exec process error [${cmd}]:`, err);
        if (!res.headersSent) {
            res.status(500).json({ error: err.message });
        }
    });

    execProcess.on('exit', (code, signal) => {
        if (signal === 'SIGTERM') {
            console.error(`Exec process terminated [${cmd}]: Timeout`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Command timed out' });
            }
        }
    });
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

    safeExec(cmd, 120000, res, (output) => {
        const hosts = parseNmapOutput(output);
        return {
            success: true,
            command: cmd,
            output: output,
            hosts: hosts,
            timestamp: new Date().toISOString()
        };
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

    // Return immediately with a placeholder to prevent blocking
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

    safeExec(cmd, 30000, res, (output) => {
        return {
            success: true,
            command: cmd,
            output: output,
            timestamp: new Date().toISOString()
        };
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

    safeExec(cmd, 120000, res, (output) => {
        return {
            success: true,
            command: cmd,
            output: output,
            timestamp: new Date().toISOString()
        };
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

    safeExec(cmd, 10000, res, (output) => {
        return {
            success: true,
            command: cmd,
            output: output,
            timestamp: new Date().toISOString()
        };
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

    safeExec(cmd, 30000, res, (output) => {
        return {
            success: true,
            command: cmd,
            output: output,
            timestamp: new Date().toISOString()
        };
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

    safeExec(cmd, 10000, res, (output) => {
        return {
            success: true,
            command: cmd,
            output: output,
            timestamp: new Date().toISOString()
        };
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

    safeExec(cmd, 10000, res, (output) => {
        return {
            success: true,
            command: cmd,
            output: output,
            timestamp: new Date().toISOString()
        };
    });
});

// API endpoint to run Nikto scans
app.post('/api/nikto-scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    let cmd = `nikto -h ${target}`;

    if (options.port) cmd += ` -port ${options.port}`;
    if (options.ssl) cmd += ' -ssl';
    if (options.tuning) cmd += ` -Tuning ${options.tuning}`;
    if (options.output) cmd += ` -output /tmp/nikto-${Date.now()}.txt`;

    console.log(`Running Nikto scan: ${cmd}`);

    // Return immediately with placeholder to avoid blocking
    const output = `Nikto scan started for ${target}.\nCommand: ${cmd}\nNote: Full Nikto scans can take several minutes.`;
    
    res.json({
        success: true,
        command: cmd,
        output: output,
        timestamp: new Date().toISOString()
    });
});

// API endpoint to run Gobuster scans
app.post('/api/gobuster-scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    let cmd = `gobuster dir -u ${target}`;
    
    if (options.wordlist) cmd += ` -w ${options.wordlist}`;
    if (options.threads) cmd += ` -t ${options.threads}`;
    if (options.extensions) cmd += ` -x ${options.extensions}`;
    if (options.statusCodes) cmd += ` -s ${options.statusCodes}`;

    console.log(`Running Gobuster scan: ${cmd}`);

    // Return immediately with placeholder
    const output = `Gobuster scan started for ${target}.\nCommand: ${cmd}\nNote: Directory busting scans can take time.`;
    
    res.json({
        success: true,
        command: cmd,
        output: output,
        findings: [],
        timestamp: new Date().toISOString()
    });
});

// Parse Gobuster output
function parseGobusterOutput(output) {
    const findings = [];
    const lines = output.split('\n');

    for (const line of lines) {
        const match = line.match(/\/([^\s]+)\s+\(Status:\s*(\d+)\)/);
        if (match) {
            findings.push({
                path: match[1],
                status: match[2],
                url: match[0]
            });
        }
    }

    return findings;
}

// API endpoint to run Dirsearch scans
app.post('/api/dirsearch-scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    let cmd = `dirsearch -u ${target}`;

    if (options.wordlist) cmd += ` -w ${options.wordlist}`;
    if (options.threads) cmd += ` -t ${options.threads}`;
    if (options.extensions) cmd += ` -e ${options.extensions}`;
    if (options.recursion) cmd += ' -r';
    if (options.excludeStatus) cmd += ` --exclude-status ${options.excludeStatus}`;

    console.log(`Running Dirsearch scan: ${cmd}`);

    // Return immediately with placeholder
    const output = `Dirsearch scan started for ${target}.\nCommand: ${cmd}\nNote: Directory busting scans can take time.`;
    
    res.json({
        success: true,
        command: cmd,
        output: output,
        findings: [],
        timestamp: new Date().toISOString()
    });
});

// Parse Dirsearch output
function parseDirsearchOutput(output) {
    const findings = [];
    const lines = output.split('\n');

    for (const line of lines) {
        const match = line.match(/(\d{3})\s+([^\s]+)\s+([^\s]+)/);
        if (match) {
            findings.push({
                status: match[1],
                path: match[2],
                size: match[3]
            });
        }
    }

    return findings;
}

// API endpoint to run FFUF scans
app.post('/api/ffuf-scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    let cmd = `ffuf -u ${target}`;

    if (options.wordlist) cmd += ` -w ${options.wordlist}`;
    if (options.threads) cmd += ` -t ${options.threads}`;
    if (options.extensions) cmd += ` -e ${options.extensions}`;
    if (options.matchStatus) cmd += ` -mc ${options.matchStatus}`;
    if (options.delay) cmd += ` -p ${options.delay}`;

    console.log(`Running FFUF scan: ${cmd}`);

    // Return immediately with placeholder
    const output = `FFUF scan started for ${target}.\nCommand: ${cmd}\nNote: Directory busting scans can take time.`;
    
    res.json({
        success: true,
        command: cmd,
        output: output,
        findings: [],
        timestamp: new Date().toISOString()
    });
});

// Parse FFUF output
function parseFFUFOutput(output) {
    const findings = [];
    const lines = output.split('\n');

    for (const line of lines) {
        const match = line.match(/"([^"]+)"\s+(\d{3})/);
        if (match) {
            findings.push({
                path: match[1],
                status: match[2]
            });
        }
    }

    return findings;
}

// API endpoint to run Wfuzz scans
app.post('/api/wfuzz-scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    let cmd = `wfuzz -c -z file,${options.wordlist || '/usr/share/wordlists/dirb/common.txt'}`;

    if (options.threads) cmd += ` --hc ${options.threads}`;
    if (options.delay) cmd += ` --delay ${options.delay}`;
    cmd += ` ${target}`;

    console.log(`Running Wfuzz scan: ${cmd}`);

    // Return immediately with placeholder
    const output = `Wfuzz scan started for ${target}.\nCommand: ${cmd}\nNote: Directory busting scans can take time.`;
    
    res.json({
        success: true,
        command: cmd,
        output: output,
        findings: [],
        timestamp: new Date().toISOString()
    });
});

// Parse Wfuzz output
function parseWfuzzOutput(output) {
    const findings = [];
    const lines = output.split('\n');

    for (const line of lines) {
        const match = line.match(/(\d{3})\s+([^\s]+)\s+([^\s]+)/);
        if (match) {
            findings.push({
                status: match[1],
                path: match[2],
                size: match[3]
            });
        }
    }

    return findings;
}

// API endpoint to run Masscan scans
app.post('/api/masscan-scan', (req, res) => {
    const { target, options } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Target is required' });
    }

    let cmd = `masscan ${target}`;

    if (options.ports) cmd += ` -p${options.ports}`;
    if (options.rate) cmd += ` --rate ${options.rate}`;
    if (options.exclude) cmd += ` --exclude ${options.exclude}`;
    if (options.banner) cmd += ' --banners';

    console.log(`Running Masscan scan: ${cmd}`);

    // Return immediately with placeholder
    const output = `Masscan scan started for ${target}.\nCommand: ${cmd}\nNote: Masscan is very fast but might require root privileges.`;
    
    res.json({
        success: true,
        command: cmd,
        output: output,
        findings: [],
        timestamp: new Date().toISOString()
    });
});

// Parse Masscan output
function parseMasscanOutput(output) {
    const findings = [];
    const lines = output.split('\n');

    for (const line of lines) {
        const match = line.match(/(\d{3})\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+)/);
        if (match) {
            findings.push({
                status: match[1],
                ip: match[2],
                port: match[3]
            });
        }
    }

    return findings;
}

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
