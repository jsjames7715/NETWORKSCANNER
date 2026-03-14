export interface UtilityOptions {
  target: string;
  tool: 'whois' | 'traceroute' | 'dns' | 'ping' | 'host' | 'nslookup';
  options?: {
    maxHops?: number;
    count?: number;
    dnsType?: string;
    server?: string;
  };
}

export interface UtilityResult {
  id: string;
  timestamp: Date;
  target: string;
  tool: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
}

class NetworkUtilitiesService {
  private scans: Map<string, UtilityResult> = new Map();

  async executeUtility(options: UtilityOptions): Promise<UtilityResult> {
    const id = this.generateId();
    
    const result: UtilityResult = {
      id,
      timestamp: new Date(),
      target: options.target,
      tool: options.tool,
      command: this.buildCommand(options),
      output: '',
      status: 'running',
    };

    this.scans.set(id, result);

    let endpoint = '';
    switch (options.tool) {
      case 'whois':
        endpoint = '/api/whois';
        break;
      case 'traceroute':
        endpoint = '/api/traceroute';
        break;
      case 'dns':
        endpoint = '/api/dns-lookup';
        break;
      case 'ping':
        endpoint = '/api/ping';
        break;
      case 'host':
        endpoint = '/api/host-lookup';
        break;
      case 'nslookup':
        endpoint = '/api/nslookup';
        break;
    }

    try {
      const body: any = { target: options.target };
      if (options.options) {
        if (options.options.maxHops) body.maxHops = options.options.maxHops;
        if (options.options.count) body.count = options.options.count;
        if (options.options.dnsType) body.type = options.options.dnsType;
        if (options.options.server) body.server = options.options.server;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Utility failed';
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

  private buildCommand(options: UtilityOptions): string {
    const target = options.target;
    const opts = options.options || {};

    switch (options.tool) {
      case 'whois':
        return `whois ${target}`;
      case 'traceroute':
        return `traceroute -m ${opts.maxHops || 30} ${target}`;
      case 'dns':
        return `dig ${target} ${opts.dnsType || 'ANY'} +short`;
      case 'ping':
        return `ping -c ${opts.count || 4} ${target}`;
      case 'host':
        return `host ${target}`;
      case 'nslookup':
        return opts.server ? `nslookup ${target} ${opts.server}` : `nslookup ${target}`;
      default:
        return '';
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getScan(id: string): UtilityResult | undefined {
    return this.scans.get(id);
  }

  getAllScans(): UtilityResult[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }
}

export const networkUtilitiesService = new NetworkUtilitiesService();
