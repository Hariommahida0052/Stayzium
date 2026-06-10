import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, Clock, CheckCircle } from 'lucide-react';

const OwnerWallet = () => {
  const [data, setData] = useState({ pendingBalance: 0, totalWithdrawn: 0, payouts: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get('/payouts/owner/summary');
        setData(res.data.data);
      } catch (error) {
        toast.error('Failed to fetch wallet summary');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading wallet details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-500 mt-1">Track your earnings and payout history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Balance */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Available to Withdraw</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{Number(data.pendingBalance).toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Withdrawn</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{Number(data.totalWithdrawn).toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.payouts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No payouts yet.
                  </td>
                </tr>
              ) : (
                data.payouts.map((payout) => (
                  <tr key={payout._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-900">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {payout._id}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm font-bold text-green-600">
                      + ₹{Number(payout.amount).toFixed(2)}
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

export default OwnerWallet;
