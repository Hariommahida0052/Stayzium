import React, { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle2, Clock, XCircle, RefreshCw, ChevronLeft, ChevronRight, DollarSign, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';
import bookingService from '../../services/bookingService';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  // Refund Modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus, searchTerm]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterStatus !== 'All Statuses') params.status = filterStatus.toLowerCase();
      if (searchTerm) params.search = searchTerm;

      const res = await bookingService.getAllBookings(params);
      if (res.data.success) {
        setBookings(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalBookings(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      toast.error('Failed to load bookings');
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmed</span>;
      case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><XCircle className="w-3 h-3 mr-1" /> Cancelled</span>;
      case 'completed': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Completed</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit capitalize">{status}</span>;
    }
  };

  const getRefundBadge = (refundStatus) => {
    switch(refundStatus?.toLowerCase()) {
      case 'refunded': return <span className="text-green-600 text-xs font-bold flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> Refunded</span>;
      case 'pending': return <span className="text-amber-600 text-xs font-bold flex items-center"><Clock className="w-3 h-3 mr-1" /> Refund Pending</span>;
      case 'rejected': return <span className="text-red-600 text-xs font-bold flex items-center"><XCircle className="w-3 h-3 mr-1" /> Refund Rejected</span>;
      default: return null;
    }
  };

  const openRefundModal = (booking) => {
    setSelectedBooking(booking);
    setRefundAmount(booking.totalAmount);
    setIsRefundModalOpen(true);
  };

  const processRefund = async (e) => {
    e.preventDefault();
    try {
      const res = await bookingService.updateRefundStatus(selectedBooking._id, 'refunded', refundAmount);
      if (res.data.success) {
        toast.success(`Refund of ₹${Number(refundAmount).toFixed(2)} processed successfully (Dummy Payment)`);
        setBookings(bookings.map(b => b._id === selectedBooking._id ? { ...b, refundStatus: 'refunded', refundAmount } : b));
        setIsRefundModalOpen(false);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const cancelBooking = (id) => {
    showConfirm('Are you sure you want to cancel this booking? This will initiate the refund process.', async () => {
      try {
        const res = await bookingService.cancelBooking(id);
        if (res.data.success) {
          toast.success('Booking cancelled successfully');
          // Update local status and mark refund pending
          setBookings(bookings.map(b => b._id === id ? { ...b, status: 'cancelled', refundStatus: 'pending' } : b));
          // Note: In a real system, cancelling might trigger a webhook. Here we manually set it to pending
          await bookingService.updateRefundStatus(id, 'pending', 0);
        }
      } catch (error) {
         console.error(error);
         toast.error(error.response?.data?.message || 'Failed to cancel booking');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Bookings & Refunds</h1>
          <p className="text-gray-600 mt-1">Oversee transactions, cancellations, and dummy payment refunds. ({totalBookings} total)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search by Booking ID..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-gray-700 capitalize"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">Loading platform bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">No bookings exist on the platform yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Booking ID</th>
                  <th className="p-4">Guest</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Amount & Refund</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-gray-500">
                      {booking._id.substring(booking._id.length - 8)}
                      <p className="text-xs text-gray-400 mt-1">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{booking.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-500">{booking.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700">{booking.hotel?.name || 'Unknown Property'}</p>
                      <p className="text-xs text-gray-500">{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">₹{Number(booking.totalAmount).toFixed(2)}</p>
                      {getRefundBadge(booking.refundStatus)}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        {booking.status === 'confirmed' && (
                          <button onClick={() => cancelBooking(booking._id)} className="text-red-600 hover:underline font-medium text-xs">Cancel Booking</button>
                        )}
                        {booking.status === 'cancelled' && booking.refundStatus === 'pending' && (
                          <button onClick={() => openRefundModal(booking)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">Process Refund</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {isRefundModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-50">
              <h2 className="text-xl font-bold text-indigo-700 flex items-center">
                <DollarSign className="w-5 h-5 mr-2" /> Process Refund (Dummy)
              </h2>
              <button onClick={() => setIsRefundModalOpen(false)} className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={processRefund} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm text-gray-700 mb-4">
                <div className="flex justify-between"><span>Booking ID:</span> <span className="font-mono">{selectedBooking._id.substring(selectedBooking._id.length - 8)}</span></div>
                <div className="flex justify-between"><span>Guest:</span> <span className="font-medium">{selectedBooking.user?.name}</span></div>
                <div className="flex justify-between"><span>Total Paid:</span> <span className="font-bold text-gray-900">₹{Number(selectedBooking.totalAmount).toFixed(2)}</span></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  max={selectedBooking.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">This is a dummy payment integration. Real funds will not be moved.</p>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsRefundModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  Complete Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
