import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';
import { DollarSign, CheckCircle } from 'lucide-react';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayouts = async () => {
    try {
      const res = await axios.get('/payouts/admin/pending');
      setPayouts(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch payouts');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  const handlePay = async (ownerId, amount) => {
    showConfirm(`Are you sure you want to mark ₹${amount.toFixed(2)} as paid for this owner?`, async () => {
      try {
        const res = await axios.post(`/payouts/admin/pay/${ownerId}`);
        if (res.data.success) {
          toast.success(res.data.message);
          fetchPayouts();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to mark as paid');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading payouts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Owner Payouts</h1>
          <p className="text-gray-500 mt-1">Manage and settle pending balances for hotel owners</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner Details</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Balance</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Bookings</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No pending payouts. All owners are settled!
                  </td>
                </tr>
              ) : (
                payouts.map((item) => (
                  <tr key={item.owner._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {item.owner.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.owner.name}</p>
                          <p className="text-sm text-gray-500">{item.owner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <span className="text-lg font-bold text-gray-900">₹{Number(item.totalPending).toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {item.bookingCount}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handlePay(item.owner._id, item.totalPending)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
                      >
                        <DollarSign className="w-4 h-4" />
                        Mark as Paid
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

export default AdminPayouts;
