import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Search, Filter } from 'lucide-react';
import bookingService from '../../services/bookingService';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getMyBookings();
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id) => {
    showConfirm('Are you sure you want to cancel this booking? This action cannot be undone.', async () => {
      try {
        const res = await bookingService.cancelBooking(id);
        if (res.data.success) {
           toast.success('Booking cancelled successfully.');
           fetchBookings(); // Refresh list
        }
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error(error.response?.data?.message || 'Failed to cancel booking.');
      }
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredBookings = bookings.filter(booking => {
    // 1. Filter by Tab
    const now = new Date();
    now.setHours(0,0,0,0);
    const checkIn = new Date(booking.checkInDate);
    checkIn.setHours(0,0,0,0);
    const checkOut = new Date(booking.checkOutDate);
    checkOut.setHours(0,0,0,0);

    const isUpcoming = (booking.status === 'confirmed' || booking.status === 'pending') && checkOut >= now;
    const isCompleted = booking.status === 'completed' || (checkOut < now && booking.status !== 'cancelled');
    const isCancelled = booking.status === 'cancelled';

    let matchesTab = false;
    if (activeTab === 'All') matchesTab = true;
    else if (activeTab === 'Upcoming') matchesTab = isUpcoming;
    else if (activeTab === 'Completed') matchesTab = isCompleted;
    else if (activeTab === 'Cancelled') matchesTab = isCancelled;

    // 2. Filter by Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
       (booking.hotel?.name || '').toLowerCase().includes(query) ||
       (booking.hotel?.location?.city || '').toLowerCase().includes(query) ||
       (booking._id || '').toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || b.checkInDate) - new Date(a.createdAt || a.checkInDate);
    if (sortBy === 'oldest') return new Date(a.createdAt || a.checkInDate) - new Date(b.createdAt || b.checkInDate);
    if (sortBy === 'price-high') return b.totalAmount - a.totalAmount;
    if (sortBy === 'price-low') return a.totalAmount - b.totalAmount;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-1">View and manage your upcoming and past trips.</p>
        </div>
        
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Search by hotel or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2962ff]/20 focus:border-[#2962ff] outline-none bg-white"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 bg-white"
            >
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              Filter
            </button>
            
            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Sort By</div>
                <button 
                  onClick={() => { setSortBy('newest'); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'newest' ? 'text-[#2962ff] font-medium' : 'text-gray-700'}`}
                >
                  Newest First
                </button>
                <button 
                  onClick={() => { setSortBy('oldest'); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'oldest' ? 'text-[#2962ff] font-medium' : 'text-gray-700'}`}
                >
                  Oldest First
                </button>
                <button 
                  onClick={() => { setSortBy('price-high'); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'price-high' ? 'text-[#2962ff] font-medium' : 'text-gray-700'}`}
                >
                  Price: High to Low
                </button>
                <button 
                  onClick={() => { setSortBy('price-low'); setShowFilter(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy === 'price-low' ? 'text-[#2962ff] font-medium' : 'text-gray-700'}`}
                >
                  Price: Low to High
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['All', 'Upcoming', 'Completed', 'Cancelled'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab 
                  ? 'border-[#2962ff] text-[#2962ff]' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              {tab} Bookings
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading your bookings...</div>
        ) : sortedBookings.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 mb-4">No bookings found in this category.</p>
            <Link to="/hotels" className="text-[#2962ff] font-medium hover:underline">Explore properties to book</Link>
          </div>
        ) : (
          sortedBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
              <img 
                src={booking.hotel?.images?.[0] || '/images/room.png'} 
                alt={booking.hotel?.name || 'Hotel'} 
                className="w-full sm:w-48 h-40 sm:h-auto object-cover rounded-xl" 
              />
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{booking.hotel?.name || 'Unknown Property'}</h3>
                    <p className="text-gray-500 flex items-center text-sm mt-1">
                      <MapPin className="w-4 h-4 mr-1" /> 
                      {booking.hotel?.location?.city || 'Location unavailable'}
                    </p>
                    <p className="text-sm font-medium text-[#2962ff] mt-2">{booking.room?.title || 'Standard Room'} - {booking.guests} Guests</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 text-xs font-semibold uppercase rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status}
                    </span>
                    <p className="font-bold text-gray-900 mt-2">₹{Number(booking.totalAmount).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 py-4 border-t border-b border-gray-50">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Check-in</p>
                    <p className="font-medium text-gray-900 text-sm mt-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" /> {formatDate(booking.checkInDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Check-out</p>
                    <p className="font-medium text-gray-900 text-sm mt-1 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" /> {formatDate(booking.checkOutDate)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-xs text-gray-500 font-mono">Booking ID: {booking._id}</p>
                  <div className="flex gap-3 w-full sm:w-auto">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && new Date(booking.checkInDate) > new Date() && (
                      <button onClick={() => handleCancelBooking(booking._id)} className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel Booking
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/user/booking-success/${booking._id}`)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-[#2962ff] text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyBookings;
