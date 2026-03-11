import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { nmapService, ScanResult } from '../services/nmapService';

const Results = () => {
  const location = useLocation();
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const [scans, setScans] = useState<ScanResult[]>([]);

  useEffect(() => {
    const allScans = nmapService.getAllScans();
    setScans(allScans);

    // If we came from a scan, select it
    if (location.state?.scanId) {
      const scan = nmapService.getScan(location.state.scanId);
      if (scan) setSelectedScan(scan);
    } else if (allScans.length > 0) {
      setSelectedScan(allScans[0]);
    }
  }, [location.state]);

  const handleExport = (format: 'txt' | 'json') => {
    if (!selectedScan) return;

    const content = format === 'json' 
      ? JSON.stringify(selectedScan, null, 2)
      : selectedScan.output;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nmap-scan-${selectedScan.id}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Scan Results</h2>
          <p className="text-gray-400 mt-1">View and manage your scan results</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExport('txt')}
            disabled={!selectedScan}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Export TXT
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={!selectedScan}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Scan List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-750 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300">Scans</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {scans.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No scans yet
                </div>
              ) : (
                scans.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => setSelectedScan(scan)}
                    className={`w-full px-4 py-3 text-left border-b border-gray-700 last:border-b-0 hover:bg-gray-700 transition-colors ${
                      selectedScan?.id === scan.id ? 'bg-cyan-600' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        scan.status === 'completed' ? 'bg-green-400' :
                        scan.status === 'running' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{scan.target}</p>
                        <p className="text-gray-400 text-xs">
                          {scan.timestamp.toLocaleDateString()} {scan.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Results Content */}
        <div className="lg:col-span-3 space-y-6">
          {selectedScan ? (
            <>
              {/* Scan Info */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedScan.target}</h3>
                    <p className="text-gray-400 text-sm">{selectedScan.command}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedScan.status === 'completed' ? 'bg-green-400' :
                      selectedScan.status === 'running' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className={`text-sm ${
                      selectedScan.status === 'completed' ? 'text-green-400' :
                      selectedScan.status === 'running' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedScan.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Target</p>
                    <p className="text-white">{selectedScan.target}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Started</p>
                    <p className="text-white">{selectedScan.timestamp.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Hosts Found</p>
                    <p className="text-white">{selectedScan.hosts?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total Ports</p>
                    <p className="text-white">
                      {selectedScan.hosts?.reduce((sum, host) => sum + host.ports.length, 0) || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Host Results */}
              {selectedScan.hosts && selectedScan.hosts.length > 0 ? (
                <div className="space-y-4">
                  {selectedScan.hosts.map((host, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-750 border-b border-gray-700 flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">{host.ip}</h4>
                          {host.hostname && (
                            <p className="text-gray-400 text-sm">{host.hostname}</p>
                          )}
                        </div>
                        {host.os && (
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300">
                            {host.os}
                          </span>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-700">
                              <th className="px-4 py-2 text-left text-gray-400 font-medium">Port</th>
                              <th className="px-4 py-2 text-left text-gray-400 font-medium">State</th>
                              <th className="px-4 py-2 text-left text-gray-400 font-medium">Service</th>
                              <th className="px-4 py-2 text-left text-gray-400 font-medium">Version</th>
                            </tr>
                          </thead>
                          <tbody>
                            {host.ports.map((port, portIndex) => (
                              <tr key={portIndex} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700">
                                <td className="px-4 py-2 text-cyan-400 font-mono">
                                  {port.port}/{port.protocol}
                                </td>
                                <td className="px-4 py-2">
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    port.state === 'open' ? 'bg-green-900 text-green-300' :
                                    port.state === 'filtered' ? 'bg-yellow-900 text-yellow-300' :
                                    'bg-gray-700 text-gray-300'
                                  }`}>
                                    {port.state}
                                  </span>
                                </td>
                                <td className="px-4 py-2 text-gray-300">{port.service}</td>
                                <td className="px-4 py-2 text-gray-400 text-xs">
                                  {port.version || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center text-gray-400">
                  {selectedScan.status === 'running' ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Scan in progress...</span>
                    </div>
                  ) : (
                    <p>No hosts found or scan results pending</p>
                  )}
                </div>
              )}

              {/* Raw Output */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Raw Output</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedScan.output);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <pre className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {selectedScan.output || 'No output available'}
                </pre>
              </div>
            </>
          ) : (
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400">No scans selected. Run a scan to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
