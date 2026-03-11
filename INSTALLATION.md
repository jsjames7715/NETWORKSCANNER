# Installation & Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Frontend
```bash
npm run build
```

### 3. Start the Server
```bash
npm run server
```

Or use the convenience script:
```bash
./start.sh
```

### 4. Open Browser
Navigate to: http://localhost:3001

## Available Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start the Express server with backend
- `npm run start` - Build and start production server

## Scanning Options

### Quick Scan
- Fast TCP scan
- Common ports only
- Uses `-T4 -F` flags

### Comprehensive Scan
- Full network discovery
- OS detection & service version
- Uses `-sS -sV -sC -O -A` flags

### Stealth Scan
- Stealthy TCP SYN scan
- Multiple scan types
- Uses `-sS -sN -sF -sX` flags

### Aggressive Scan
- Fast and comprehensive
- Uses `-A -T4` flags

### Custom Scan
- Full control over options:
  - Specific ports
  - Scan speed (T0-T5)
  - OS detection
  - Version detection
  - Script scanning
  - Custom arguments

## API Endpoint

### POST /api/scan
Execute Nmap scans via HTTP.

Example:
```bash
curl -X POST http://localhost:3001/api/scan \
  -H "Content-Type: application/json" \
  -d '{
    "target": "scanme.nmap.org",
    "options": {
      "scanType": "quick"
    }
  }'
```

## Troubleshooting

### Nmap not found
Install Nmap:
```bash
# Ubuntu/Debian
sudo apt-get install nmap

# CentOS/RHEL
sudo yum install nmap

# macOS
brew install nmap
```

### Port in use
Change port in `server.cjs` line 5:
```javascript
const PORT = process.env.PORT || 3001;
```

### Permission issues
Some scans require root:
```bash
sudo npm run server
```

## Security Warning

⚠️ **Only scan networks you have explicit permission to scan**

Unauthorized scanning is illegal in most jurisdictions. This tool is for educational purposes and authorized security testing only.
