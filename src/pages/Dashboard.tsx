import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { nmapService, ScanResult } from '../services/nmapService';
import { nucleiService, NucleiResult } from '../services/nucleiService';
import { networkUtilitiesService } from '../services/networkUtilities';

const Dashboard = () => {
  const [recentScans, setRecentScans] = useState<(ScanResult | NucleiResult)[]>([]);
  const [stats, setStats] = useState({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    activeScans: 0,
  });

  useEffect(() => {
    const nmapScans = nmapService.getAllScans();
    const nucleiScans = nucleiService.getAllScans();
    const utilitiesScans = networkUtilitiesService.getAllScans();
    const allScans = [...nmapScans, ...nucleiScans, ...utilitiesScans].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setRecentScans(allScans.slice(0, 5));
    setStats({
      totalScans: allScans.length,
      successfulScans: allScans.filter(s => s.status === 'completed').length,
      failedScans: allScans.filter(s => s.status === 'error').length,
      activeScans: allScans.filter(s => s.status === 'running').length,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 mt-1">Welcome to Network Scanner Pro</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Scans</p>
              <p className="text-2xl font-bold text-white">{stats.totalScans}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Successful</p>
              <p className="text-2xl font-bold text-green-400">{stats.successfulScans}</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-2xl font-bold text-red-400">{stats.failedScans}</p>
            </div>
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Scans</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.activeScans}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Scan Options */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Scan Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/quick-scan"
            state={{ scanType: 'quick' }}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Nmap Quick</p>
                <p className="text-gray-400 text-sm">Fast TCP scan</p>
              </div>
            </div>
          </Link>
          <Link
            to="/quick-scan"
            state={{ scanType: 'comprehensive' }}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Nmap Comprehensive</p>
                <p className="text-gray-400 text-sm">Full scan with OS detection</p>
              </div>
            </div>
          </Link>
          <Link
            to="/nuclei-scan"
            state={{ scanType: 'quick' }}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Nuclei Quick</p>
                <p className="text-gray-400 text-sm">Vulnerability scan</p>
              </div>
            </div>
          </Link>
          <Link
            to="/nuclei-scan"
            state={{ scanType: 'vulnerability' }}
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Nuclei Vuln</p>
                <p className="text-gray-400 text-sm">Critical vulns only</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Additional Tools */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Additional Security Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/nikto-scan"
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Nikto</p>
                <p className="text-gray-400 text-sm">Web server scanner</p>
              </div>
            </div>
          </Link>
          <Link
            to="/directory-busting"
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Directory Busting</p>
                <p className="text-gray-400 text-sm">Gobuster/Dirsearch/FFUF</p>
              </div>
            </div>
          </Link>
          <Link
            to="/masscan-scan"
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Masscan</p>
                <p className="text-gray-400 text-sm">High-speed port scanner</p>
              </div>
            </div>
          </Link>
          <Link
            to="/network-utilities"
            className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 transition-colors border border-gray-600 hover:border-cyan-500"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">Network Utilities</p>
                <p className="text-gray-400 text-sm">Traceroute, WHOIS, DNS, Ping</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Scans</h3>
          <Link to="/results" className="text-cyan-400 hover:text-cyan-300 text-sm">
            View All
          </Link>
        </div>
        {recentScans.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No scans yet. Start your first scan!
          </div>
        ) : (
          <div className="space-y-3">
            {recentScans.map((scan) => (
              <div
                key={scan.id}
                className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-3"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    scan.status === 'completed' ? 'bg-green-400' :
                    scan.status === 'running' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <div>
                    <p className="text-white">{scan.target}</p>
                    <p className="text-gray-400 text-sm">{scan.command}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">
                    {scan.timestamp.toLocaleTimeString()}
                  </p>
                  <p className={`text-sm ${
                    scan.status === 'completed' ? 'text-green-400' :
                    scan.status === 'running' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {scan.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
