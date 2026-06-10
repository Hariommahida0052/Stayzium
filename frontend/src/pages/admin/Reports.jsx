import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertTriangle, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import reportService from '../../services/reportService';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReports();
  }, [page, filterStatus, searchTerm]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filterStatus !== 'All Statuses') params.status = filterStatus.toLowerCase();
      if (searchTerm) params.search = searchTerm;

      const res = await reportService.getAdminReports(params);
      if (res.data.success) {
        setReports(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!adminNotes.trim()) {
      return toast.error('Please provide action notes');
    }

    try {
      const res = await reportService.updateReportStatus(selectedReport._id, 'resolved', adminNotes);
      if (res.data.success) {
        toast.success('Report resolved successfully');
        setReports(reports.map(r => r._id === selectedReport._id ? { ...r, status: 'resolved', adminNotes } : r));
        setSelectedReport(null);
        setAdminNotes('');
      }
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.error('Failed to resolve report');
    }
  };

  const handleDismiss = (id) => {
    showConfirm('Are you sure you want to dismiss this report? No action will be taken.', async () => {
      try {
        const res = await reportService.updateReportStatus(id, 'dismissed', 'Dismissed by admin');
        if (res.data.success) {
          toast.success('Report dismissed');
          setReports(reports.map(r => r._id === id ? { ...r, status: 'dismissed' } : r));
        }
      } catch (error) {
        console.error('Error dismissing report:', error);
        toast.error('Failed to dismiss report');
      }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><AlertTriangle className="w-3 h-3 mr-1" /> Pending</span>;
      case 'resolved':
        return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><ShieldCheck className="w-3 h-3 mr-1" /> Resolved</span>;
      case 'dismissed':
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><CheckCircle2 className="w-3 h-3 mr-1" /> Dismissed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit capitalize">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-600 mt-1">Review flagged users, properties, and reviews.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              placeholder="Search reasons..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-gray-700"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex items-center justify-center h-64">
               <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
             </div>
          ) : reports.length === 0 ? (
             <div className="flex items-center justify-center h-64 text-gray-500">No reports found. All good!</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Reported Type</th>
                  <th className="p-4">Reported By</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-gray-900 capitalize">{report.reportType}</span>
                      <p className="text-xs text-gray-500 mt-1">ID: {report._id.substring(report._id.length - 6)}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700">{report.reportedBy?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-700 max-w-xs truncate">{report.reason}</p>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {report.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setSelectedReport(report)} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors">Resolve</button>
                          <button onClick={() => handleDismiss(report._id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">Dismiss</button>
                        </div>
                      ) : (
                        <button onClick={() => setSelectedReport(report)} className="text-indigo-600 hover:underline font-medium text-xs">View Notes</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Resolve Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Resolve Report</h2>
              <button onClick={() => setSelectedReport(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 bg-white">
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-sm font-semibold text-red-800 mb-1">Reason for Report</p>
                <p className="text-sm text-red-900">{selectedReport.reason}</p>
              </div>

              {selectedReport.status !== 'pending' ? (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 mb-1">Admin Action Notes</p>
                  <p className="text-sm text-gray-600">{selectedReport.adminNotes || 'No notes provided.'}</p>
                </div>
              ) : (
                <form onSubmit={handleResolve} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken (Admin Notes)</label>
                    <textarea 
                      required
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Explain the action taken to resolve this report..."
                      className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-32 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setSelectedReport(null)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                      Confirm Resolution
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
