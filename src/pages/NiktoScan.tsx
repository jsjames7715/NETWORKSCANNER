import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { niktoService, NiktoOptions } from '../services/niktoService';

const NiktoScan = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [options, setOptions] = useState({
    port: '',
    ssl: false,
    tuning: '0123456789',
  });

  const handleScan = async () => {
    if (!target.trim()) return;

    setIsScanning(true);
    const scanOptions: NiktoOptions = {
      target: target.trim(),
      port: options.port || undefined,
      ssl: options.ssl,
      tuning: options.tuning,
    };

    try {
      const result = await niktoService.executeScan(scanOptions);
      navigate('/results', { state: { scanId: result.id } });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const tuningPresets = [
    { id: '0123456789', label: 'All Tests', description: 'Run all Nikto tests' },
    { id: '0', label: 'No Tests', description: 'Disable all tests' },
    { id: '1', label: 'File Upload', description: 'File upload tests' },
    { id: '2', label: 'Information Disclosure', description: 'Information disclosure tests' },
    { id: '3', label: 'Authentication Issues', description: 'Authentication tests' },
    { id: '4', label: 'Injection', description: 'Injection tests' },
    { id: '5', label: 'XSS', description: 'Cross-site scripting tests' },
    { id: '6', label: 'CSRF', description: 'CSRF tests' },
    { id: '7', label: 'RCE', description: 'Remote code execution tests' },
    { id: '8', label: 'SQLi', description: 'SQL injection tests' },
    { id: '9', label: 'XXE', description: 'XML external entity tests' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Nikto Scan</h2>
          <p className="text-gray-400 mt-1">Web server vulnerability scanner</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target (URL or IP address)
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., https://example.com, 192.168.1.1"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Options */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Scan Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Port</label>
                <input
                  type="text"
                  value={options.port}
                  onChange={(e) => setOptions({ ...options, port: e.target.value })}
                  placeholder="e.g., 80, 443"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  checked={options.ssl}
                  onChange={(e) => setOptions({ ...options, ssl: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-gray-300">Use SSL (https)</span>
              </div>
            </div>
          </div>

          {/* Tuning Presets */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Tuning Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {tuningPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setOptions({ ...options, tuning: preset.id })}
                  className={`p-2 rounded text-left text-xs transition-colors ${
                    options.tuning === preset.id
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{preset.label}</div>
                  <div className="text-gray-400 text-xs">{preset.description}</div>
                </button>
              ))}
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
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Start Nikto Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Commands</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nikto -h example.com</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nikto -h example.com -ssl</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nikto -h example.com -p 8080</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nikto -h example.com -Tuning 0123456789</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Nikto Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>6700+ potentially dangerous files/CGIs</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Check for outdated server versions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Server configuration issues</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Web application security tests</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NiktoScan;
