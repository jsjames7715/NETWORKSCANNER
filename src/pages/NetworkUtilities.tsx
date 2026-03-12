import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { networkUtilitiesService, UtilityOptions } from '../services/networkUtilities';

const NetworkUtilities = () => {
  const navigate = useNavigate();
  const [target, setTarget] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [tool, setTool] = useState<'whois' | 'traceroute' | 'dns' | 'ping' | 'host' | 'nslookup'>('whois');
  const [options, setOptions] = useState({
    maxHops: 30,
    count: 4,
    dnsType: 'ANY',
    server: '',
  });

  const handleExecute = async () => {
    if (!target.trim()) return;

    setIsRunning(true);
    const utilityOptions: UtilityOptions = {
      target: target.trim(),
      tool,
      options: {
        maxHops: options.maxHops,
        count: options.count,
        dnsType: options.dnsType,
        server: options.server,
      },
    };

    try {
      const result = await networkUtilitiesService.executeUtility(utilityOptions);
      navigate('/results', { state: { scanId: result.id } });
    } catch (error) {
      console.error('Utility failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const tools = [
    { id: 'whois', label: 'WHOIS', description: 'Domain registration info', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'traceroute', label: 'Traceroute', description: 'Network path tracing', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'dns', label: 'DNS Lookup', description: 'Domain name system query', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'ping', label: 'Ping', description: 'Network connectivity test', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'host', label: 'Host', description: 'Reverse DNS lookup', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
    { id: 'nslookup', label: 'Nslookup', description: 'DNS query tool', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  const renderOptions = () => {
    switch (tool) {
      case 'traceroute':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Max Hops</label>
              <input
                type="number"
                value={options.maxHops}
                onChange={(e) => setOptions({ ...options, maxHops: parseInt(e.target.value) || 30 })}
                min="1"
                max="255"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        );
      case 'ping':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Packet Count</label>
              <input
                type="number"
                value={options.count}
                onChange={(e) => setOptions({ ...options, count: parseInt(e.target.value) || 4 })}
                min="1"
                max="100"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        );
      case 'dns':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Record Type</label>
              <select
                value={options.dnsType}
                onChange={(e) => setOptions({ ...options, dnsType: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ANY">ANY</option>
                <option value="A">A</option>
                <option value="AAAA">AAAA</option>
                <option value="MX">MX</option>
                <option value="TXT">TXT</option>
                <option value="NS">NS</option>
                <option value="CNAME">CNAME</option>
              </select>
            </div>
          </div>
        );
      case 'nslookup':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">DNS Server (optional)</label>
              <input
                type="text"
                value={options.server}
                onChange={(e) => setOptions({ ...options, server: e.target.value })}
                placeholder="e.g., 8.8.8.8"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Network Utilities</h2>
          <p className="text-gray-400 mt-1">Basic networking diagnostic tools</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target & Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tool Selection */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Select Tool</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                  <div className="font-medium text-white">{t.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Input */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target (Domain or IP)
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., example.com or 8.8.8.8"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          {/* Tool Options */}
          {renderOptions() && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Options</h3>
              {renderOptions()}
            </div>
          )}

          {/* Execute Button */}
          <button
            onClick={handleExecute}
            disabled={isRunning || !target.trim()}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-colors flex items-center justify-center space-x-2"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Running {tool}...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Run {tool}</span>
              </>
            )}
          </button>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Tool Description</h3>
            <div className="text-sm text-gray-400 space-y-3">
              {tool === 'whois' && (
                <>
                  <p>WHOIS queries domain registration information from registries.</p>
                  <p>Shows owner details, registration dates, and nameservers.</p>
                </>
              )}
              {tool === 'traceroute' && (
                <>
                  <p>Traces the network path to a target.</p>
                  <p>Shows each hop (router) along the route with latency.</p>
                </>
              )}
              {tool === 'dns' && (
                <>
                  <p>Performs DNS queries for domain records.</p>
                  <p>Supports A, AAAA, MX, TXT, NS, CNAME records.</p>
                </>
              )}
              {tool === 'ping' && (
                <>
                  <p>Tests network connectivity to a target.</p>
                  <p>Sends ICMP packets to check response time.</p>
                </>
              )}
              {tool === 'host' && (
                <>
                  <p>Performs reverse DNS lookups.</p>
                  <p>Resolves IP addresses to hostnames.</p>
                </>
              )}
              {tool === 'nslookup' && (
                <>
                  <p>Queries DNS name servers.</p>
                  <p>Can specify custom DNS server for queries.</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Popular Commands</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">whois example.com</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">traceroute 8.8.8.8</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">dig example.com A</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">ping -c 4 google.com</div>
              <div className="bg-gray-700 rounded p-2 font-mono text-xs">host 1.1.1.1</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkUtilities;
