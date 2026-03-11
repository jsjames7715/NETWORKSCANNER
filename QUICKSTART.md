# Network Scanner Pro - Quick Start Guide

## Overview

Network Scanner Pro is a user-friendly web application that integrates Nmap for network scanning. It provides a graphical interface with push-button scanning options.

## Quick Start in 3 Steps

### Step 1: Install & Run
```bash
npm install
npm run build
npm run server
```

### Step 2: Open Browser
Navigate to: **http://localhost:3001**

### Step 3: Start Scanning!
- Click "Quick Scan" in the sidebar
- Enter a target (IP or hostname)
- Select scan type
- Click "Start Scan"

## Popular Scan Options

| Scan Type | Description | Use Case |
|-----------|-------------|----------|
| Quick | Fast TCP scan on common ports | Initial reconnaissance |
| Comprehensive | Full scan with OS & version detection | Detailed analysis |
| Stealth | Stealthy TCP SYN scan | Security testing |
| Aggressive | Fast comprehensive scan | Speed + detail |
| Custom | Full control | Specific requirements |

## Example Scans

### Quick Local Network Scan
```
Target: 192.168.1.1
Scan Type: Quick
```

### Web Server Scan
```
Target: example.com
Scan Type: Custom
Ports: 80,443,8080
Features: Version detection
```

### Full Network Discovery
```
Target: 192.168.1.0/24
Scan Type: Comprehensive
```

## Commands Reference

### Quick Scans
- **Quick Scan**: `nmap -T4 -F [target]`
- **Comprehensive**: `nmap -sS -sV -sC -O -A [target]`
- **Stealth**: `nmap -sS -sN -sF -sX [target]`
- **Aggressive**: `nmap -A -T4 [target]`

### Common Custom Options
- Specific ports: `-p 80,443,8080`
- Port range: `-p 1-1000`
- OS detection: `-O`
- Version detection: `-sV`
- Script scan: `-sC`
- Speed control: `-T0` (slow) to `-T5` (fast)

## Viewing Results

1. Scans appear automatically in the Results page
2. Click on any scan to view detailed results
3. Tables show open ports, services, and versions
4. Use "Export TXT" or "Export JSON" to save results

## Troubleshooting

### Server won't start
- Check if port 3001 is free: `netstat -tulpn | grep 3001`
- Try different port: `PORT=3002 npm run server`

### Scans fail
- Verify Nmap is installed: `nmap --version`
- Check permissions (some scans need root)
- Test with scanme.nmap.org (public test server)

### No results shown
- Wait for scan completion (can take minutes)
- Check server logs for errors
- Verify target is reachable

## Security Notes

⚠️ **Only scan networks you have permission to scan**
⚠️ **Unauthorized scanning may be illegal**
⚠️ **This tool is for authorized security testing only**

## Support

- Check INSTALLATION.md for detailed setup
- Check README.md for architecture details
- Use scanme.nmap.org for testing
