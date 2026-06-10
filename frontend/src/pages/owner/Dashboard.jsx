import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Home, TrendingUp, CalendarCheck, Building2, BedDouble } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import hotelService from '../../services/hotelService';
import analyticsService from '../../services/analyticsService';
import bookingService from '../../services/bookingService';
import Button from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
const OwnerDashboard = () => {

  const [analytics, setAnalytics] = useState({
    totalProperties: 0,
    totalBookings: 0,
    ownerRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [, analyticsRes, bookingsRes] = await Promise.all([
          hotelService.getOwnerHotels(),
          analyticsService.getOwnerSummary(),
          bookingService.getOwnerBookings()
        ]);
        
        // if (hotelsRes.data.success) {
        //   setProperties(hotelsRes.data.data);
        // }
        
        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data.data);
        }
        
        if (bookingsRes.data.success) {
          // Take top 5 recent bookings
          const sortedBookings = bookingsRes.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentBookings(sortedBookings.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching owner dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    const downloadToast = toast.loading('Generating report...');
    try {
      const response = await analyticsService.downloadOwnerReport();
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stayzium_owner_report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Report downloaded successfully!', { id: downloadToast });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report', { id: downloadToast });
    }
    setIsDownloading(false);
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    const syncToast = toast.loading('Syncing with external calendars...');
    try {
      await hotelService.syncCalendar();
      toast.success('Calendars synchronized successfully!', { id: syncToast });
    } catch (error) {
      toast.error('Failed to sync calendars.', { id: syncToast });
    }
    setIsSyncing(false);
  };

  const stats = [
    { label: 'Total Revenue', value: `₹${(analytics.ownerRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, trend: '+12%', color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Total Bookings', value: (analytics.totalBookings || 0).toString(), icon: CalendarCheck, trend: '+5%', color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Properties', value: (analytics.totalProperties || 0).toString(), icon: Home, trend: '0%', color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Total Guests', value: ((analytics.totalBookings || 0) * 2).toString(), icon: Users, trend: '+8%', color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your properties today.</p>
        </div>
        <Button onClick={handleDownloadReport} disabled={isDownloading} variant="primary">
          {isDownloading ? 'Downloading...' : 'Download Report'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex flex-col">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className={`flex items-center text-sm font-semibold ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
                  {stat.trend.startsWith('+') && <TrendingUp className="w-4 h-4 mr-1" />}
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
            <Link to="/owner/bookings" className="text-sm font-medium text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">ID / Guest</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {recentBookings.length > 0 ? recentBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{booking.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{booking._id.substring(booking._id.length - 8)}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{booking.hotel?.name || 'Property'}</td>
                    <td className="p-4 text-gray-600 text-xs">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-gray-900">₹{Number(booking.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold uppercase rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      <CalendarCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p>No recent bookings found for your properties.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/owner/hotels" className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl flex items-center transition-colors">
                <Building2 className="w-5 h-5 mr-3 text-gray-400" /> Add New Property
              </Link>
              <Link to="/owner/rooms" className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl flex items-center transition-colors">
                <BedDouble className="w-5 h-5 mr-3 text-gray-400" /> Manage Rooms
              </Link>
              <button disabled={isSyncing} onClick={handleSyncCalendar} className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl flex items-center transition-colors text-left disabled:opacity-50">
                <CalendarCheck className="w-5 h-5 mr-3 text-gray-400" /> {isSyncing ? 'Syncing...' : 'Sync Calendar'}
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900 to-gray-900 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Increase your visibility</h3>
              <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                Properties with high-quality photos get 40% more bookings. Update your gallery today.
              </p>
              <Link to="/owner/hotels" className="px-4 py-2 bg-white text-blue-900 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm inline-block">
                Update Photos
              </Link>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-6 -bottom-6 opacity-20">
              <TrendingUp className="w-32 h-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;

