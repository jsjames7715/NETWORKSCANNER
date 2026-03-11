export interface DirectoryOptions {
  target: string;
  tool: 'gobuster' | 'dirsearch' | 'ffuf' | 'wfuzz';
  wordlist?: string;
  threads?: number;
  extensions?: string;
  statusCodes?: string;
  delay?: number;
  recursion?: boolean;
}

export interface DirectoryResult {
  id: string;
  timestamp: Date;
  target: string;
  tool: string;
  command: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  findings?: DirectoryFinding[];
}

export interface DirectoryFinding {
  path: string;
  status: string;
  size?: string;
}

class DirectoryService {
  private scans: Map<string, DirectoryResult> = new Map();

  async executeScan(options: DirectoryOptions): Promise<DirectoryResult> {
    const id = this.generateId();
    
    const result: DirectoryResult = {
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
      case 'gobuster':
        endpoint = '/api/gobuster-scan';
        break;
      case 'dirsearch':
        endpoint = '/api/dirsearch-scan';
        break;
      case 'ffuf':
        endpoint = '/api/ffuf-scan';
        break;
      case 'wfuzz':
        endpoint = '/api/wfuzz-scan';
        break;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: options.target,
          options: {
            wordlist: options.wordlist,
            threads: options.threads,
            extensions: options.extensions,
            statusCodes: options.statusCodes,
            delay: options.delay,
            recursion: options.recursion,
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

  private buildCommand(options: DirectoryOptions): string {
    let cmd = '';

    switch (options.tool) {
      case 'gobuster':
        cmd = `gobuster dir -u ${options.target}`;
        if (options.wordlist) cmd += ` -w ${options.wordlist}`;
        if (options.threads) cmd += ` -t ${options.threads}`;
        if (options.extensions) cmd += ` -x ${options.extensions}`;
        if (options.statusCodes) cmd += ` -s ${options.statusCodes}`;
        break;
      case 'dirsearch':
        cmd = `dirsearch -u ${options.target}`;
        if (options.wordlist) cmd += ` -w ${options.wordlist}`;
        if (options.threads) cmd += ` -t ${options.threads}`;
        if (options.extensions) cmd += ` -e ${options.extensions}`;
        if (options.recursion) cmd += ' -r';
        break;
      case 'ffuf':
        cmd = `ffuf -u ${options.target}/FUZZ`;
        if (options.wordlist) cmd += ` -w ${options.wordlist}`;
        if (options.threads) cmd += ` -t ${options.threads}`;
        if (options.extensions) cmd += ` -e ${options.extensions}`;
        if (options.statusCodes) cmd += ` -mc ${options.statusCodes}`;
        if (options.delay) cmd += ` -p ${options.delay}`;
        break;
      case 'wfuzz':
        cmd = `wfuzz -c -z file,${options.wordlist || '/usr/share/wordlists/dirb/common.txt'} ${options.target}/FUZZ`;
        if (options.threads) cmd += ` --hc ${options.threads}`;
        if (options.delay) cmd += ` --delay ${options.delay}`;
        break;
    }

    return cmd;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getScan(id: string): DirectoryResult | undefined {
    return this.scans.get(id);
  }

  getAllScans(): DirectoryResult[] {
    return Array.from(this.scans.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  deleteScan(id: string): boolean {
    return this.scans.delete(id);
  }
}

export const directoryService = new DirectoryService();
