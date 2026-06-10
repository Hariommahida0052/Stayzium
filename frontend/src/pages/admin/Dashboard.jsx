import React, { useState, useEffect } from 'react';
import { Users, Building2, CalendarCheck, DollarSign, ArrowUpRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import analyticsService from '../../services/analyticsService';
import SystemHealthModal from '../../components/admin/SystemHealthModal';

const AdminDashboard = () => {
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState('days');
  const [chartData, setChartData] = useState([]);
  
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    platformRevenue: 0,
    pendingApprovals: 0,
    recentActivity: [],
    revenueSources: []
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getAdminSummary();
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching admin analytics:', err);
      }
    };
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await analyticsService.getChartData(timeframe);
        if (res.data.success) {
          setChartData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    };
    fetchChartData();
  }, [timeframe]);

  const stats = [
    { label: 'Total Users', value: analytics.totalUsers.toLocaleString(), icon: Users, trend: '+5.2%', color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Total Properties', value: analytics.totalHotels.toLocaleString(), icon: Building2, trend: '+12.5%', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Total Bookings', value: analytics.totalBookings.toLocaleString(), icon: CalendarCheck, trend: '+18.2%', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Platform Revenue', value: `₹${(analytics.platformRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, trend: '+24.5%', color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Pending Approvals', value: analytics.pendingApprovals?.toLocaleString() || '0', icon: Building2, trend: 'Action Required', color: 'text-red-500', bg: 'bg-red-50', link: '/admin/hotels?status=pending' },
  ];

  const maxChartValue = Math.max(...chartData.map(d => d.bookings), 1); // Avoid division by zero

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <p className="text-gray-600 mt-1">Monitor the overall performance and activity of Stayzium.</p>
        </div>
        <button onClick={() => setIsHealthModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center">
          <Activity className="w-4 h-4 mr-2" /> System Health
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => (
          stat.link ? (
            <Link key={idx} to={stat.link} className="bg-white p-6 rounded-2xl border border-red-200 shadow-md flex flex-col hover:bg-red-50 transition-colors cursor-pointer ring-1 ring-red-100">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="flex items-center text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </Link>
          ) : (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="flex items-center text-sm font-semibold text-green-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </div>
          )
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Active Properties Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Booking Volume Analytics</h2>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1 outline-none font-medium text-gray-700 cursor-pointer"
            >
              <option value="days">Last 7 Days</option>
              <option value="weeks">Last 4 Weeks</option>
              <option value="months">Last 12 Months</option>
              <option value="year">Last 5 Years</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 mt-6 pb-8 relative min-h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">Loading chart data...</div>
            )}
          </div>
        </div>

        {/* Revenue Sources */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Revenue Sources</h2>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center relative">
            {analytics.revenueSources && analytics.revenueSources.length > 0 && analytics.revenueSources.some(s => s.value > 0) ? (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.revenueSources.filter(s => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {analytics.revenueSources.filter(s => s.value > 0).map((entry, index) => {
                          const COLORS = ['#4f46e5', '#10b981', '#0ea5e9'];
                          return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                        })}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                        labelStyle={{ display: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {analytics.revenueSources.filter(s => s.value > 0).map((entry, index) => {
                     const COLORS = ['#4f46e5', '#10b981', '#0ea5e9'];
                     return (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        {entry.name}
                      </div>
                     )
                  })}
                </div>
              </>
            ) : (
               <div className="text-center text-gray-500 text-sm py-4">No revenue data available</div>
            )}
          </div>
        </div>
      </div>

      {/* System Health Modal */}
      <SystemHealthModal 
        isOpen={isHealthModalOpen} 
        onClose={() => setIsHealthModalOpen(false)} 
      />
    </div>
  );
};

export default AdminDashboard;
