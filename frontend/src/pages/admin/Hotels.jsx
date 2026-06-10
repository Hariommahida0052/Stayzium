import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, Building2, ChevronLeft, ChevronRight, X, MessageSquareWarning } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { showConfirm } from '../../utils/toastUtils';
import hotelService from '../../services/hotelService';

const AdminHotels = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);

  // Rejection Modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchHotels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus, searchTerm]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filterStatus !== 'All Statuses') params.status = filterStatus.toLowerCase();
      if (searchTerm) params.search = searchTerm;

      const res = await hotelService.getAdminHotels(params);
      if (res.data.success) {
        setProperties(res.data.data);
        setTotalPages(res.data.pagination.pages);
        setTotalHotels(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus, reason = '') => {
    try {
      const res = await hotelService.updateHotelStatus(id, newStatus, reason);
      if (res.data.success) {
        toast.success(`Property ${newStatus} successfully`);
        setProperties(properties.map(p => p._id === id ? { ...p, status: newStatus } : p));
        if (newStatus === 'rejected') {
          setIsRejectModalOpen(false);
          setRejectionReason('');
          setRejectId(null);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(`Failed to ${newStatus} property`);
    }
  };

  const confirmSuspend = (id) => {
    showConfirm('Are you sure you want to suspend this property? It will be hidden from users.', () => {
      handleStatusChange(id, 'suspended');
    });
  };

  const confirmApprove = (id) => {
    showConfirm('Are you sure you want to approve this property? It will be live on the platform.', () => {
      handleStatusChange(id, 'approved');
    });
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setIsRejectModalOpen(true);
  };

  const submitReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      return toast.error('Please provide a reason for rejection');
    }
    handleStatusChange(rejectId, 'rejected', rejectionReason);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Verification</h1>
          <p className="text-gray-600 mt-1">Review and manage properties listed by owners. ({totalHotels} total)</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search by property name or city..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-gray-700 capitalize"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Properties Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex items-center justify-center h-64 text-gray-500">Loading properties...</div>
          ) : properties.length === 0 ? (
             <div className="flex items-center justify-center h-64 text-gray-500">No properties found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Property</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {properties.map((property) => (
                  <tr key={property._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center">
                        {property.images && property.images.length > 0 ? (
                          <img src={property.images[0]} alt={property.name} className="w-10 h-10 rounded-lg object-cover mr-3" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center mr-3">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900">{property.name}</p>
                          <p className="text-xs text-gray-500">ID: {property._id.substring(property._id.length - 6)} • Listed: {new Date(property.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700">{property.owner?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{property.owner?.email}</p>
                    </td>
                    <td className="p-4 text-gray-600">{property.location?.city}, {property.location?.country}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center w-fit capitalize ${
                        property.status === 'approved' ? 'bg-green-100 text-green-700' :
                        property.status === 'suspended' || property.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {property.status === 'approved' && <ShieldCheck className="w-3 h-3 mr-1" />}
                        {(property.status === 'suspended' || property.status === 'rejected') && <ShieldAlert className="w-3 h-3 mr-1" />}
                        {property.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {property.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => confirmApprove(property._id)} className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors">Approve</button>
                          <button onClick={() => openRejectModal(property._id)} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors">Reject</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 items-center">
                          <button 
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const res = await axios.put(`/hotels/admin/${property._id}/featured`, {}, { headers: { Authorization: `Bearer ${token}` }});
                                if (res.data.success) {
                                  setProperties(properties.map(p => p._id === property._id ? { ...p, isFeatured: !p.isFeatured } : p));
                                  toast.success(property.isFeatured ? 'Removed from Featured' : 'Marked as Featured');
                                }
                              } catch(err) { toast.error('Failed to update featured status'); }
                            }} 
                            className={`p-1.5 rounded-lg transition-colors ${property.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400 hover:text-yellow-600'}`}
                            title={property.isFeatured ? "Unfeature" : "Feature on Homepage"}
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          </button>
                          {property.status === 'approved' && <button onClick={() => confirmSuspend(property._id)} className="text-amber-600 hover:underline font-medium text-xs ml-1">Suspend</button>}
                          {(property.status === 'suspended' || property.status === 'rejected') && <button onClick={() => confirmApprove(property._id)} className="text-green-600 hover:underline font-medium text-xs ml-1">Re-Approve</button>}
                          <button onClick={() => window.open(`/hotels/${property._id}`, '_blank')} className="text-indigo-600 hover:underline font-medium text-sm ml-2">View</button>
                        </div>
                      )}
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

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
              <h2 className="text-xl font-bold text-red-700 flex items-center">
                <MessageSquareWarning className="w-5 h-5 mr-2" /> Reject Property
              </h2>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-red-400 hover:text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={submitReject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection</label>
                <textarea 
                  required
                  rows="4"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
                  placeholder="Explain why this property was rejected... This will be visible to the owner."
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;
