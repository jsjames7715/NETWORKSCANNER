import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nucleiService, NucleiOptions } from '../services/nucleiService';

const NucleiScan = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState('quick');

  const handleScan = async () => {
    if (!target.trim()) return;

    setIsScanning(true);
    const options: NucleiOptions = {
      target: target.trim(),
      scanType: scanType as NucleiOptions['scanType'],
    };

    try {
      const result = await nucleiService.executeScan(options);
      navigate('/results', { state: { scanId: result.id } });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const scanTypes = [
    { id: 'quick', label: 'Quick Scan', description: 'Fast scan with common templates', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'vulnerability', label: 'Vulnerability', description: 'Vulnerability detection templates', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { id: 'exposure', label: 'Exposure', description: 'Exposed services and data', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'misconfiguration', label: 'Misconfiguration', description: 'Security misconfigurations', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Nuclei Scan</h2>
          <p className="text-gray-400 mt-1">Web vulnerability scanner using Nuclei templates</p>
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

          {/* Scan Type Selection */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Scan Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setScanType(type.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    scanType === type.id
                      ? 'bg-cyan-600 border-cyan-500'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-cyan-800 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-white">{type.label}</p>
                      <p className="text-sm text-gray-400">{type.description}</p>
                    </div>
                  </div>
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
                <span>Start Nuclei Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Scan Options Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Commands</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nuclei -u example.com</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nuclei -u example.com -severity high</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nuclei -u example.com -t exposures/</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">nuclei -u example.com -t vulnerabilities/ -rate-limit 10</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Nuclei Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>3000+ community templates</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Multiple severity levels</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Custom template support</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Rate limiting for safety</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Severity Levels</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Critical</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">High</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Medium</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Low</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-300 text-sm">Info</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NucleiScan;
