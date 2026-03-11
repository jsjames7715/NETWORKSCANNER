import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { masscanService, MasscanOptions } from '../services/masscanService';

const MasscanScan = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [options, setOptions] = useState({
    ports: '0-65535',
    rate: 1000,
    exclude: '',
    banner: false,
  });

  const handleScan = async () => {
    if (!target.trim()) return;

    setIsScanning(true);
    const scanOptions: MasscanOptions = {
      target: target.trim(),
      ports: options.ports,
      rate: options.rate,
      exclude: options.exclude || undefined,
      banner: options.banner,
    };

    try {
      const result = await masscanService.executeScan(scanOptions);
      navigate('/results', { state: { scanId: result.id } });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const portPresets = [
    { id: '0-65535', label: 'All Ports', description: 'Scan all 65,535 ports' },
    { id: 'top-1000', label: 'Top 1000', description: 'Most common 1000 ports' },
    { id: '80,443,8080,8443', label: 'Web Ports', description: 'Common web ports' },
    { id: '21,22,23,25,53,110,143,993,995,3389', label: 'Common Services', description: 'FTP, SSH, Telnet, SMTP, DNS, etc.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Masscan Scan</h2>
          <p className="text-gray-400 mt-1">High-speed port scanner</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Input & Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Input */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target (IP address or CIDR range)
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 192.168.1.1 or 192.168.1.0/24"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Port Options */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Port Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ports</label>
                <input
                  type="text"
                  value={options.ports}
                  onChange={(e) => setOptions({ ...options, ports: e.target.value })}
                  placeholder="e.g., 80,443 or 1-1000"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Rate (packets/sec)</label>
                <input
                  type="number"
                  value={options.rate}
                  onChange={(e) => setOptions({ ...options, rate: parseInt(e.target.value) || 1000 })}
                  min="1"
                  max="100000"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Port Presets */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Port Presets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {portPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setOptions({ ...options, ports: preset.id })}
                  className={`p-3 rounded text-left text-sm transition-colors ${
                    options.ports === preset.id
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

          {/* Additional Options */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Additional Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Exclude IPs</label>
                <input
                  type="text"
                  value={options.exclude}
                  onChange={(e) => setOptions({ ...options, exclude: e.target.value })}
                  placeholder="e.g., 192.168.1.100"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="flex items-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  checked={options.banner}
                  onChange={(e) => setOptions({ ...options, banner: e.target.checked })}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-gray-300">Capture banners</span>
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
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Start Masscan</span>
              </>
            )}
          </button>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Commands</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">masscan 192.168.1.0/24 -p0-65535</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">masscan 10.0.0.0/8 --rate 10000</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">masscan 192.168.1.1 -p80,443 --banners</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">masscan 192.168.1.0/24 -p0-1000 --rate 50000</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Masscan Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Scans millions of ports per second</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Efficient TCP port scanning</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Supports CIDR ranges</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Banner grabbing support</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Use higher rates for faster scanning</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Exclude sensitive IPs when scanning</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Requires root/administrator privileges</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasscanScan;
