import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import bookingService from '../../services/bookingService';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingService.getOwnerBookings();
      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setIsLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      const res = await bookingService.updateBookingStatus(id, 'confirmed');
      if (res.data.success) {
        toast.success('Booking confirmed successfully');
        setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'confirmed' } : b));
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Failed to confirm booking');
    }
  };

  const handleDecline = async (id) => {
    showConfirm('Are you sure you want to decline this booking?', async () => {
      try {
        const res = await bookingService.updateBookingStatus(id, 'cancelled');
        if (res.data.success) {
          toast.success('Booking cancelled successfully');
          setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
        }
      } catch (error) {
        console.error('Error declining booking:', error);
        toast.error('Failed to decline booking');
      }
    });
  };

  const filteredBookings = bookings.filter(b => {
    const guestName = b.user?.name || '';
    const bookingId = b._id || '';
    return guestName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           bookingId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      case 'completed': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit">{status}</span>;
    }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
          <p className="text-gray-600 mt-1">Manage guest bookings and reservation requests.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header/Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by guest name or booking ID..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchBookings()} className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center bg-white shadow-sm">
              Refresh
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No bookings found for your properties yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Booking Details</th>
                  <th className="p-4">Property & Room</th>
                  <th className="p-4">Stay Dates</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900">{booking.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">ID: {booking._id.substring(booking._id.length - 8)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Booked: {formatDate(booking.createdAt)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700">{booking.hotel?.name || 'Unknown Property'}</p>
                      <p className="text-xs text-gray-500">{booking.room?.title || 'Room'}</p>
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                    </td>
                    <td className="p-4 font-bold text-gray-900">₹{Number(booking.totalAmount).toFixed(2)}</td>
                    <td className="p-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {booking.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleApprove(booking._id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">Approve</button>
                          <button onClick={() => handleDecline(booking._id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">Decline</button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedBooking(booking)} className="text-blue-600 hover:underline font-medium text-sm">View Details</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Guest Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Guest Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{selectedBooking.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedBooking.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Contact Number</p>
                    <p className="font-medium text-gray-900">{selectedBooking.user?.contactNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100"></div>

              {/* Stay Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Stay Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Property</p>
                    <p className="font-medium text-gray-900">{selectedBooking.hotel?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Room</p>
                    <p className="font-medium text-gray-900">{selectedBooking.room?.title || 'Unknown Room'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Check-out</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedBooking.checkOutDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Guests</p>
                    <p className="font-medium text-gray-900">{selectedBooking.guests} Guests</p>
                  </div>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <>
                  <div className="border-t border-gray-100"></div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Special Requests</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm italic">{selectedBooking.specialRequests}</p>
                  </div>
                </>
              )}

              <div className="border-t border-gray-100"></div>

              {/* Payment Info */}
              <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-blue-800 font-medium mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-blue-900">₹{Number(selectedBooking.totalAmount).toFixed(2)}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-xs text-blue-800 font-medium mb-2">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
