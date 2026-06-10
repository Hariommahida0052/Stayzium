import React, { useState, useEffect } from 'react';
import { Activity, X, CheckCircle2, Server, Database, Users, CalendarCheck, AlertTriangle } from 'lucide-react';
import analyticsService from '../../services/analyticsService';

const SystemHealthModal = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval;
    const fetchHealth = async () => {
      try {
        const res = await analyticsService.getSystemHealth();
        if (res.data.success) {
          setHealthData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch system health", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      setLoading(true);
      fetchHealth();
      // Poll every 15 seconds while open
      interval = setInterval(fetchHealth, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Activity className="w-6 h-6 mr-2" /> System Health Dashboard
          </h2>
          <button onClick={onClose} className="text-white hover:bg-indigo-700 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1 space-y-6">
          {loading && !healthData ? (
             <div className="flex justify-center items-center py-10">
                <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             </div>
          ) : healthData ? (
            <>
              {/* Overall Status */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Overall Status</h3>
                  <div className="flex items-center mt-2">
                    {healthData.databaseStatus === 'Operational' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                    )}
                    <span className="text-xl font-bold text-gray-900">
                      {healthData.databaseStatus === 'Operational' ? 'All Systems Operational' : 'System Degraded'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Last updated</p>
                  <p className="text-sm font-medium text-gray-700">Just now</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-700 font-medium">
                      <Server className="w-5 h-5 mr-2 text-indigo-500" /> Server Status
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-bold">{healthData.serverStatus}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">CPU Usage</span><span className="font-medium">{healthData.cpuUsage}%</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${healthData.cpuUsage > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{width: `${healthData.cpuUsage}%`}}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1"><span className="text-gray-500">Memory</span><span className="font-medium">{healthData.memoryUsage}%</span></div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${healthData.memoryUsage > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${healthData.memoryUsage}%`}}></div></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-gray-700 font-medium">
                      <Database className="w-5 h-5 mr-2 text-blue-500" /> Database Health
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-md font-bold ${healthData.databaseStatus === 'Operational' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {healthData.databaseStatus}
                    </span>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Query Latency</span>
                      <span className="font-semibold text-gray-900">{healthData.queryLatency}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Connections</span>
                      <span className="font-semibold text-gray-900">{healthData.dbConnections}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Activity */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-gray-800">Platform Performance & Activity</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 p-1.5 bg-indigo-50 text-indigo-600 rounded-lg mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Active Users (Live)</p>
                        <p className="text-xs text-gray-500">Sockets currently connected</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">{healthData.activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                    <div className="flex items-center">
                      <CalendarCheck className="w-8 h-8 p-1.5 bg-emerald-50 text-emerald-600 rounded-lg mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Booking Velocity</p>
                        <p className="text-xs text-gray-500">Bookings per hour</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-emerald-600">{healthData.bookingVelocity}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 hover:bg-red-50 rounded-lg transition-colors border border-red-50">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 p-1.5 bg-red-100 text-red-600 rounded-lg mr-3" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Error Rate</p>
                        <p className="text-xs text-gray-500">API request failures</p>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-red-600">{healthData.errorRate}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-10">Failed to load system health data.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthModal;
