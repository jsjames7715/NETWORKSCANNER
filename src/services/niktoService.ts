export interface NiktoOptions {
  target: string;
  port?: string;
  ssl?: boolean;
  tuning?: string;
  customArgs?: string[];
}

export interface NiktoResult {
  id: string;
  timestamp: Date;
  target: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  findings?: NiktoFinding[];
}

export interface NiktoFinding {
  id: string;
  type: string;
  message: string;
  reference?: string;
}

class NiktoService {
  private scans: Map<string, NiktoResult> = new Map();

  async executeScan(options: NiktoOptions): Promise<NiktoResult> {
    const id = this.generateId();
    
    const result: NiktoResult = {
      id,
      timestamp: new Date(),
      target: options.target,
      command: this.buildCommand(options),
      output: '',
      status: 'running',
    };

    this.scans.set(id, result);

    try {
      const response = await fetch('/api/nikto-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: options.target,
          options: {
            port: options.port,
            ssl: options.ssl,
            tuning: options.tuning,
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

      const data = await response.json();
      result.output = data.output;
      result.status = 'completed';
    } catch (error) {
      result.status = 'error';
      result.output = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  }

  private buildCommand(options: NiktoOptions): string {
    let cmd = `nikto -h ${options.target}`;

    if (options.port) cmd += ` -port ${options.port}`;
    if (options.ssl) cmd += ' -ssl';
    if (options.tuning) cmd += ` -Tuning ${options.tuning}`;
    if (options.customArgs && options.customArgs.length > 0) {
      cmd += ' ' + options.customArgs.join(' ');
    }

    return cmd;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getScan(id: string): NiktoResult | undefined {
    return this.scans.get(id);
  }

  getAllScans(): NiktoResult[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }
}

export const niktoService = new NiktoService();
