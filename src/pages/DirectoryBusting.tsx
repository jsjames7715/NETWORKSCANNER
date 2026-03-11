import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { directoryService, DirectoryOptions } from '../services/directoryService';

const DirectoryBusting = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [tool, setTool] = useState<'gobuster' | 'dirsearch' | 'ffuf' | 'wfuzz'>('gobuster');
  const [options, setOptions] = useState({
    wordlist: '/usr/share/wordlists/dirb/common.txt',
    threads: 10,
    extensions: 'php,html,js,txt,backup',
    statusCodes: '200,204,301,302,307,403',
    delay: 0,
    recursion: true,
  });

  const handleScan = async () => {
    if (!target.trim()) return;

    setIsScanning(true);
    const scanOptions: DirectoryOptions = {
      target: target.trim(),
      tool,
      ...options,
    };

    try {
      const result = await directoryService.executeScan(scanOptions);
      navigate('/results', { state: { scanId: result.id } });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const tools = [
    { id: 'gobuster', label: 'Gobuster', description: 'Fast directory brute-forcing written in Go', color: 'bg-blue-600' },
    { id: 'dirsearch', label: 'Dirsearch', description: 'Python-based directory scanner', color: 'bg-green-600' },
    { id: 'ffuf', label: 'FFUF', description: 'Fast web fuzzer written in Go', color: 'bg-purple-600' },
    { id: 'wfuzz', label: 'Wfuzz', description: 'Flexible web scanner written in Python', color: 'bg-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Directory Busting</h2>
          <p className="text-gray-400 mt-1">Find hidden directories and files</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Input & Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tool Selection */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Select Tool</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tools.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id as any)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    tool === t.id
                      ? 'bg-cyan-600 border-cyan-500'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${t.color} rounded-lg flex items-center justify-center`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">{t.label}</p>
                      <p className="text-sm text-gray-400">{t.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Input */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target URL
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., https://example.com"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Scan Options */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Scan Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Wordlist</label>
                <input
                  type="text"
                  value={options.wordlist}
                  onChange={(e) => setOptions({ ...options, wordlist: e.target.value })}
                  placeholder="/usr/share/wordlists/dirb/common.txt"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Threads</label>
                <input
                  type="number"
                  value={options.threads}
                  onChange={(e) => setOptions({ ...options, threads: parseInt(e.target.value) || 10 })}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Extensions</label>
                <input
                  type="text"
                  value={options.extensions}
                  onChange={(e) => setOptions({ ...options, extensions: e.target.value })}
                  placeholder="php,html,js"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status Codes</label>
                <input
                  type="text"
                  value={options.statusCodes}
                  onChange={(e) => setOptions({ ...options, statusCodes: e.target.value })}
                  placeholder="200,301,403"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Start Scan Button */}
          <button
            onClick={handleScan}
            disabled={isScanning || !target.trim()}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors flex items-center justify-center space-x-2"
          >
            {isScanning ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Scanning with {tool}...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Start Directory Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Commands</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">gobuster dir -u https://example.com -w /usr/share/wordlists/dirb/common.txt</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">dirsearch -u https://example.com -e php,html</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">ffuf -u https://example.com/FUZZ -w wordlist.txt</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">wfuzz -c -z file,wordlist.txt https://example.com/FUZZ</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Tool Comparison</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300">Gobuster - Fastest (Go)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Dirsearch - Feature-rich (Python)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-300">FFUF - Very fast, flexible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-300">Wfuzz - Powerful, many options</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Wordlists</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>/usr/share/wordlists/dirb/common.txt</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>/usr/share/wordlists/wfuzz/general/common.txt</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectoryBusting;
