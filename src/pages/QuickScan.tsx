import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { nmapService, ScanOptions } from '../services/nmapService';

const QuickScan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState(location.state?.scanType || 'quick');

  const handleScan = async () => {
    if (!target.trim()) return;

    setIsScanning(true);
    const options: ScanOptions = {
      target: target.trim(),
      scanType: scanType as ScanOptions['scanType'],
    };

    try {
      const result = await nmapService.executeScan(options);
      navigate('/results', { state: { scanId: result.id } });
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const scanTypes = [
    { id: 'quick', label: 'Quick Scan', description: 'Fast TCP scan on common ports', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'comprehensive', label: 'Comprehensive', description: 'Full scan with OS detection and service version', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'stealth', label: 'Stealth', description: 'Stealthy TCP SYN scan', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'aggressive', label: 'Aggressive', description: 'Fast scan with OS and service detection', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Quick Scan</h2>
          <p className="text-gray-400 mt-1">Run fast, targeted network scans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target (IP address or hostname)
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., 192.168.1.1, scanme.nmap.org"
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
                <span>Start Scan</span>
              </>
            )}
          </button>
        </div>

        {/* Scan Options Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Commands</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-2 font-mono">nmap -sV -sC -O -A [target]</div>
              <div className="bg-gray-700 rounded p-2 font-mono">nmap -p 1-65535 [target]</div>
              <div className="bg-gray-700 rounded p-2 font-mono">nmap -sP [network]/24</div>
              <div className="bg-gray-700 rounded p-2 font-mono">nmap -T4 -F [target]</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Tips</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Use IP ranges like 192.168.1.1-100 for multiple targets</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Scanme.nmap.org is available for testing</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Use -p to scan specific ports</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickScan;
