export interface MasscanOptions {
  target: string;
  ports?: string;
  rate?: number;
  exclude?: string;
  banner?: boolean;
}

export interface MasscanResult {
  id: string;
  timestamp: Date;
  target: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  findings?: MasscanFinding[];
}

export interface MasscanFinding {
  ip: string;
  port: number;
  protocol: string;
  service?: string;
}

class MasscanService {
  private scans: Map<string, MasscanResult> = new Map();

  async executeScan(options: MasscanOptions): Promise<MasscanResult> {
    const id = this.generateId();
    
    const result: MasscanResult = {
      id,
      timestamp: new Date(),
      target: options.target,
      command: this.buildCommand(options),
      output: '',
      status: 'running',
    };

    this.scans.set(id, result);

    try {
      const response = await fetch('/api/masscan-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: options.target,
          options: {
            ports: options.ports,
            rate: options.rate,
            exclude: options.exclude,
            banner: options.banner,
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

      const data = await response.json();
      result.output = data.output;
      result.findings = data.findings;
      result.status = 'completed';
    } catch (error) {
      result.status = 'error';
      result.output = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  private buildCommand(options: MasscanOptions): string {
    let cmd = `masscan ${options.target}`;

    if (options.ports) cmd += ` -p${options.ports}`;
    if (options.rate) cmd += ` --rate ${options.rate}`;
    if (options.exclude) cmd += ` --exclude ${options.exclude}`;
    if (options.banner) cmd += ' --banners';

    return cmd;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getScan(id: string): MasscanResult | undefined {
    return this.scans.get(id);
  }

  getAllScans(): MasscanResult[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }
}

export const masscanService = new MasscanService();
