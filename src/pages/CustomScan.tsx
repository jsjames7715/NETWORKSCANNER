import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nmapService, ScanOptions } from '../services/nmapService';

const CustomScan = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [options, setOptions] = useState({
    ports: '',
    speed: 'T4' as ScanOptions['speed'],
    osDetection: false,
    versionDetection: true,
    scriptScan: false,
    customArgs: '',
  });

  const handleScan = async () => {
    if (!target.trim()) return;

    setIsScanning(true);
    const scanOptions: ScanOptions = {
      target: target.trim(),
      scanType: 'custom',
      ports: options.ports || undefined,
      speed: options.speed,
      osDetection: options.osDetection,
      versionDetection: options.versionDetection,
      scriptScan: options.scriptScan,
      customArgs: options.customArgs.split(' ').filter(arg => arg),
    };

    try {
      const result = await nmapService.executeScan(scanOptions);
      navigate('/results', { state: { scanId: result.id } });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Custom Scan</h2>
        <p className="text-gray-400 mt-1">Configure advanced scanning options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Options Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target Input */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 192.168.1.1, 192.168.1.0/24, scanme.nmap.org"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Scan Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Port Options */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Port Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Ports</label>
                  <input
                    type="text"
                    value={options.ports}
                    onChange={(e) => setOptions({ ...options, ports: e.target.value })}
                    placeholder="e.g., 80,443,8080 or 1-1000"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Scan Speed</label>
                  <select
                    value={options.speed}
                    onChange={(e) => setOptions({ ...options, speed: e.target.value as ScanOptions['speed'] })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="T0">T0 - Paranoid (Slowest)</option>
                    <option value="T1">T1 - Sneaky</option>
                    <option value="T2">T2 - Polite</option>
                    <option value="T3">T3 - Normal</option>
                    <option value="T4">T4 - Aggressive</option>
                    <option value="T5">T5 - Insane (Fastest)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scan Features */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Scan Features</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.versionDetection}
                    onChange={(e) => setOptions({ ...options, versionDetection: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">Service Version Detection (-sV)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.osDetection}
                    onChange={(e) => setOptions({ ...options, osDetection: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">OS Detection (-O)</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.scriptScan}
                    onChange={(e) => setOptions({ ...options, scriptScan: e.target.checked })}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                  />
                  <span className="text-gray-300">Script Scan (-sC)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Custom Arguments */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Custom Arguments</h3>
            <input
              type="text"
              value={options.customArgs}
              onChange={(e) => setOptions({ ...options, customArgs: e.target.value })}
              placeholder="e.g., -T4 -F --top-ports 1000"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
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
                <span>Start Custom Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Command Preview */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-4">Command Preview</h3>
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 break-all">
              nmap
              {options.speed && ` -T${options.speed}`}
              {options.ports && ` -p ${options.ports}`}
              {options.osDetection && ' -O'}
              {options.versionDetection && ' -sV'}
              {options.scriptScan && ' -sC'}
              {options.customArgs && ` ${options.customArgs}`}
              {target && ` ${target}`}
            </div>
          </div>

          {/* Quick Command Templates */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Command Templates</h3>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => setOptions({ ...options, ports: '1-1024', speed: 'T4', versionDetection: true, osDetection: false, scriptScan: false, customArgs: '' })}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
              >
                Quick Top Ports (1-1024)
              </button>
              <button
                onClick={() => setOptions({ ...options, ports: '', speed: 'T4', versionDetection: true, osDetection: true, scriptScan: true, customArgs: '' })}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
              >
                Comprehensive Scan
              </button>
              <button
                onClick={() => setOptions({ ...options, ports: '80,443', speed: 'T4', versionDetection: true, osDetection: false, scriptScan: false, customArgs: '' })}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
              >
                Web Server Scan
              </button>
              <button
                onClick={() => setOptions({ ...options, ports: '', speed: 'T2', versionDetection: false, osDetection: false, scriptScan: false, customArgs: '-sP' })}
                className="w-full text-left px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
              >
                Ping Sweep
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomScan;
