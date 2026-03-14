export interface ScanOptions {
  target: string;
  scanType: 'quick' | 'comprehensive' | 'stealth' | 'aggressive' | 'custom';
  ports?: string;
  speed?: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  osDetection?: boolean;
  versionDetection?: boolean;
  scriptScan?: boolean;
  customArgs?: string[];
}

export interface ScanResult {
  id: string;
  timestamp: Date;
  target: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  hosts?: Host[];
}

export interface Host {
  ip: string;
  hostname?: string;
  ports: Port[];
  os?: string;
}

export interface Port {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version?: string;
}

class NmapService {
  private scans: Map<string, ScanResult> = new Map();

  async executeScan(options: ScanOptions): Promise<ScanResult> {
    const id = this.generateId();
    
    const result: ScanResult = {
      id,
      timestamp: new Date(),
      target: options.target,
      command: this.buildCommand(options),
      output: '',
      status: 'running',
    };

    this.scans.set(id, result);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: options.target,
          options: {
            scanType: options.scanType,
            ports: options.ports,
            speed: options.speed,
            osDetection: options.osDetection,
            versionDetection: options.versionDetection,
            scriptScan: options.scriptScan,
            customArgs: options.customArgs,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Scan failed';
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      const data = JSON.parse(responseText);
      result.output = data.output;
      result.hosts = data.hosts;
      result.status = 'completed';
    } catch (error) {
      console.error('Nmap scan error:', error);
      result.status = 'error';
      result.output = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  private buildCommand(options: ScanOptions): string {
    let cmd = 'nmap';

    // Scan type
    switch (options.scanType) {
      case 'quick':
        cmd += ' -T4 -F';
        break;
      case 'comprehensive':
        cmd += ' -sS -sV -sC -O -A';
        break;
      case 'stealth':
        cmd += ' -sS -sN -sF -sX';
        break;
      case 'aggressive':
        cmd += ' -A -T4';
        break;
      case 'custom':
        break;
    }

    // Speed
    if (options.speed) {
      cmd += ` -T${options.speed}`;
    }

    // Ports
    if (options.ports) {
      cmd += ` -p ${options.ports}`;
    }

    // OS Detection
    if (options.osDetection) {
      cmd += ' -O';
    }

    // Version Detection
    if (options.versionDetection) {
      cmd += ' -sV';
    }

    // Script Scan
    if (options.scriptScan) {
      cmd += ' -sC';
    }

    // Custom arguments
    if (options.customArgs && options.customArgs.length > 0) {
      cmd += ' ' + options.customArgs.join(' ');
    }

    // Target
    cmd += ` ${options.target}`;

    return cmd;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getScan(id: string): ScanResult | undefined {
    return this.scans.get(id);
  }

  getAllScans(): ScanResult[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }
}

export const nmapService = new NmapService();
