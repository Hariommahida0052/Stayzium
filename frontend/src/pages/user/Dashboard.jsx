import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, CreditCard, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

const UserDashboard = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState({
    upcomingTrips: 0,
    pastBookings: 0,
    savedPlaces: 0,
    rewardPoints: 0,
    nextAdventure: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await userService.getDashboardStats();
        if (res.data.success) {
          setStatsData(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const stats = [
    { label: 'Upcoming Trips', value: statsData.upcomingTrips, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Past Bookings', value: statsData.pastBookings, icon: Clock, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Saved Places', value: statsData.savedPlaces, icon: MapPin, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Reward Points', value: statsData.rewardPoints.toLocaleString(), icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-1">Here is the overview of your travel activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Trip */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Next Adventure</h2>
              <Link to="/user/bookings" className="text-sm font-medium text-primary flex items-center hover:underline">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="p-6">
              {statsData.nextAdventure ? (
                <div className="flex flex-col md:flex-row gap-6">
                  <img src={statsData.nextAdventure.hotel?.images?.[0] || '/images/room.png'} alt={statsData.nextAdventure.hotel?.name || 'Hotel'} className="w-full md:w-48 h-32 object-cover rounded-xl shadow-sm" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-bold text-gray-900">{statsData.nextAdventure.hotel?.name || 'Unknown Property'}</h3>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${statsData.nextAdventure.status === 'confirmed' ? 'text-green-700 bg-green-100' : 'text-yellow-700 bg-yellow-100'}`}>
                          {statsData.nextAdventure.status}
                        </span>
                      </div>
                      <p className="text-gray-500 flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-1" /> {statsData.nextAdventure.hotel?.location?.city || 'Location unavailable'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 mt-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Check-in</p>
                        <p className="font-medium text-gray-900">{new Date(statsData.nextAdventure.checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Check-out</p>
                        <p className="font-medium text-gray-900">{new Date(statsData.nextAdventure.checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>You have no upcoming adventures.</p>
                  <Link to="/hotels" className="text-primary hover:underline mt-2 inline-block">Explore Hotels</Link>
                </div>
              )}
              {statsData.nextAdventure && (
                <div className="mt-6 flex space-x-3">
                  <Link to={`/user/booking-success/${statsData.nextAdventure._id}`} className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </Link>
                  {statsData.nextAdventure.hotel ? (
                    <Link to={`/hotels/${statsData.nextAdventure.hotel._id}`} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                      Contact Property
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 border border-gray-200 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
                      Property Unavailable
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recommendations */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recommended for you</h2>
            <div className="space-y-4">
              <div className="flex gap-4 group cursor-pointer">
                <img src="/images/kutch.png" alt="Hotel" className="w-20 h-20 object-cover rounded-xl group-hover:opacity-90 transition-opacity" />
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">Rann Utsav Tent</h4>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" /> Kutch, Gujarat
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">₹25000.00<span className="text-xs text-gray-500 font-normal">/night</span></p>
                </div>
              </div>
              <div className="flex gap-4 group cursor-pointer">
                <img src="/images/gir.png" alt="Hotel" className="w-20 h-20 object-cover rounded-xl group-hover:opacity-90 transition-opacity" />
                <div>
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">Gir Wildlife Resort</h4>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" /> Sasan Gir
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">₹18000.00<span className="text-xs text-gray-500 font-normal">/night</span></p>
                </div>
              </div>
            </div>
            <Link to="/hotels" className="block text-center w-full mt-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Explore More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
