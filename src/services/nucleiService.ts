export interface NucleiOptions {
  target: string;
  scanType: 'quick' | 'vulnerability' | 'exposure' | 'misconfiguration' | 'custom';
  templates?: string;
  severity?: string;
  excludeId?: string;
  rateLimit?: number;
  concurrency?: number;
  customArgs?: string[];
}

export interface NucleiResult {
  id: string;
  timestamp: Date;
  target: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  findings?: NucleiFinding[];
}

export interface NucleiFinding {
  templateID: string;
  name: string;
  severity: string;
  type: string;
  matchedAt?: string;
  description?: string;
  reference?: string[];
}

class NucleiService {
  private scans: Map<string, NucleiResult> = new Map();

  async executeScan(options: NucleiOptions): Promise<NucleiResult> {
    const id = this.generateId();
    
    const result: NucleiResult = {
      id,
      timestamp: new Date(),
      target: options.target,
      command: this.buildCommand(options),
      output: '',
      status: 'running',
    };

    this.scans.set(id, result);

    try {
      const response = await fetch('/api/nuclei-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: options.target,
          options: {
            scanType: options.scanType,
            templates: options.templates,
            severity: options.severity,
            excludeId: options.excludeId,
            rateLimit: options.rateLimit,
            concurrency: options.concurrency,
            customArgs: options.customArgs,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scan failed');
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

  private buildCommand(options: NucleiOptions): string {
    let cmd = 'nuclei -u ' + options.target;

    // Scan type
    switch (options.scanType) {
      case 'quick':
        cmd += ' -t /path/to/nuclei-templates';
        break;
      case 'vulnerability':
        cmd += ' -t vulnerabilities/';
        break;
      case 'exposure':
        cmd += ' -t exposures/';
        break;
      case 'misconfiguration':
        cmd += ' -t misconfiguration/';
        break;
      case 'custom':
        break;
    }

    // Templates
    if (options.templates) {
      cmd += ` -t ${options.templates}`;
    }

    // Severity
    if (options.severity) {
      cmd += ` -severity ${options.severity}`;
    }

    // Exclude IDs
    if (options.excludeId) {
      cmd += ` -exclude-id ${options.excludeId}`;
    }

    // Rate limit
    if (options.rateLimit) {
      cmd += ` -rate-limit ${options.rateLimit}`;
    }

    // Concurrency
    if (options.concurrency) {
      cmd += ` -concurrency ${options.concurrency}`;
    }

    // Custom arguments
    if (options.customArgs && options.customArgs.length > 0) {
      cmd += ' ' + options.customArgs.join(' ');
    }

    return cmd;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getScan(id: string): NucleiResult | undefined {
    return this.scans.get(id);
  }

  getAllScans(): NucleiResult[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }
}

export const nucleiService = new NucleiService();
