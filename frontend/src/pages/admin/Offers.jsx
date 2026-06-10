import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Power, PowerOff, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import offerService from '../../services/offerService';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await offerService.getAllOffers();
      if (res.data.success) {
        setOffers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await offerService.toggleOfferStatus(id);
      fetchOffers(); // Refresh the list
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status');
    }
  };

  const deleteOffer = async (id) => {
    showConfirm('Are you sure you want to delete this offer?', async () => {
      try {
        await offerService.deleteOffer(id);
        toast.success('Offer deleted successfully');
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast.error('Failed to delete offer');
      }
    });
  };

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Offers</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional offers.</p>
        </div>
        <Link 
          to="/admin/offers/new" 
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Offer
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Offer Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Discount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Validity</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No offers found. Create your first offer to attract more bookings!
                  </td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={offer.image || '/images/room.png'} 
                          alt={offer.title} 
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100" 
                        />
                        <div>
                          <p className="font-medium text-gray-900">{offer.title}</p>
                          <p className="text-xs text-gray-500 max-w-[200px] truncate">{offer.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md text-white ${offer.color || 'bg-blue-500'}`}>
                        {offer.discount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {new Date(offer.validUntil).toLocaleDateString()}
                        </p>
                        {isExpired(offer.validUntil) ? (
                          <span className="text-xs text-red-500 font-medium">Expired</span>
                        ) : (
                          <span className="text-xs text-green-500 font-medium">Active timeframe</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        offer.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => toggleStatus(offer._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          offer.isActive 
                            ? 'text-yellow-600 hover:bg-yellow-50 bg-white border border-yellow-200' 
                            : 'text-green-600 hover:bg-green-50 bg-white border border-green-200'
                        }`}
                        title={offer.isActive ? "Deactivate" : "Activate"}
                      >
                        {offer.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <Link 
                        to={`/admin/offers/edit/${offer._id}`}
                        className="p-2 inline-flex rounded-lg text-blue-600 hover:bg-blue-50 bg-white border border-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => deleteOffer(offer._id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 bg-white border border-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOffers;
