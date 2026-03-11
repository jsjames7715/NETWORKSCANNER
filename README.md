# Network Scanner Pro

A user-friendly web application for network scanning using Nmap. This tool provides a graphical interface for running common Nmap scans with push-button simplicity.

## Features

- **Quick Scans**: Fast TCP scans on common ports
- **Comprehensive Scans**: Full scans with OS detection and service version
- **Stealth Scans**: Stealthy TCP SYN scans
- **Aggressive Scans**: Fast scans with comprehensive detection
- **Custom Scans**: Full control over all Nmap options
- **Results Display**: Easy-to-read tables of scan results
- **Export Options**: Export results to TXT or JSON format

## Prerequisites

- Node.js (v14 or higher)
- Nmap installed on your system
- npm (Node Package Manager)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

## Running the Application

1. Start the server:
   ```bash
   npm run server
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3001
   ```

Or use the convenience script:
   ```bash
   ./start.sh
   ```

## Usage

### Quick Scanning

1. Navigate to "Quick Scan" in the sidebar
2. Enter a target (IP address or hostname)
3. Select a scan type (Quick, Comprehensive, Stealth, or Aggressive)
4. Click "Start Scan"
5. View results on the Results page

### Custom Scanning

1. Navigate to "Custom Scan" in the sidebar
2. Enter a target
3. Configure options:
   - Ports: Specific ports or ranges (e.g., "80,443" or "1-1000")
   - Scan Speed: T0 (slowest) to T5 (fastest)
   - Features: OS detection, version detection, script scanning
   - Custom Arguments: Any additional Nmap flags
4. Click "Start Custom Scan"
5. View results on the Results page

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js server
- **Scanning**: Nmap command-line tool
- **Routing**: React Router

## API Endpoints

### POST /api/scan

Execute an Nmap scan.

**Request Body:**
```json
{
  "target": "192.168.1.1",
  "options": {
    "scanType": "quick",
    "ports": "80,443",
    "speed": "T4",
    "osDetection": true,
    "versionDetection": true,
    "scriptScan": false,
    "customArgs": ""
  }
}
```

**Response:**
```json
{
  "success": true,
  "command": "nmap -T4 -F 192.168.1.1",
  "output": "...",
  "hosts": [...],
  "timestamp": "2026-03-11T18:45:49.768Z"
}
```

## Security Considerations

- Only scan networks you have permission to scan
- Scanning without authorization may be illegal
- This tool is intended for educational and authorized security testing purposes

## Troubleshooting

### Nmap not found

Ensure Nmap is installed and in your PATH:
```bash
nmap --version
```

### Port already in use

Change the port in `server.cjs`:
```javascript
const PORT = process.env.PORT || 3001; // Change 3001 to another port
```

### Permission denied

Some Nmap scans require root/administrator privileges. The basic scans should work without elevated privileges.

## License

MIT License - use responsibly and only on networks you have permission to scan.
