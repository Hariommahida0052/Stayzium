import React, { useState, useEffect } from 'react';
import { Search, Loader2, MessageSquare, CheckCircle, Clock, Send, X } from 'lucide-react';
import ticketService from '../../services/ticketService';
import toast from 'react-hot-toast';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [page, filterStatus, searchTerm]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filterStatus !== 'All Statuses') params.status = filterStatus.toLowerCase();
      if (searchTerm) params.search = searchTerm;

      const res = await ticketService.getAdminTickets(params);
      if (res.data.success) {
        setTickets(res.data.data);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await ticketService.updateTicketStatus(id, status);
      toast.success(`Ticket marked as ${status}`);
      setTickets(tickets.map(t => t._id === id ? { ...t, status } : t));
      if (selectedTicket && selectedTicket._id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    
    try {
      const res = await ticketService.addAdminMessage(selectedTicket._id, replyMessage);
      if (res.data.success) {
        toast.success('Reply sent successfully');
        setReplyMessage('');
        // Update local state
        const updatedTicket = res.data.data;
        setTickets(tickets.map(t => t._id === updatedTicket._id ? updatedTicket : t));
        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><MessageSquare className="w-3 h-3 mr-1" /> Open</span>;
      case 'in_progress':
        return <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><Clock className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'resolved':
        return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</span>;
      case 'closed':
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit"><X className="w-3 h-3 mr-1" /> Closed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center w-fit capitalize">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">Manage user support requests and issues.</p>
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
              placeholder="Search subjects..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-gray-700"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Tickets List */}
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
             <div className="flex items-center justify-center h-64">
               <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
             </div>
          ) : tickets.length === 0 ? (
             <div className="flex items-center justify-center h-64 text-gray-500">No tickets found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Ticket Subject</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900">{ticket.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {ticket._id.substring(ticket._id.length - 6)} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-700">{ticket.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{ticket.user?.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold uppercase ${
                        ticket.priority === 'high' ? 'text-red-600' : 
                        ticket.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button 
                        onClick={() => setSelectedTicket(ticket)} 
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        View & Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedTicket.subject}</h2>
                <p className="text-sm text-gray-500 mt-1">From: {selectedTicket.user?.name}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 mb-2">Original Message</p>
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </div>

              {selectedTicket.messages && selectedTicket.messages.map((msg, idx) => (
                <div key={idx} className={`p-4 rounded-xl shadow-sm max-w-[85%] ${msg.sender === selectedTicket.user?._id ? 'bg-white border border-gray-100' : 'bg-indigo-50 border border-indigo-100 ml-auto'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-bold text-gray-900">{msg.sender === selectedTicket.user?._id ? selectedTicket.user?.name : 'Admin'}</p>
                    <p className="text-[10px] text-gray-500">{new Date(msg.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white">
              {['closed', 'resolved'].includes(selectedTicket.status) ? (
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    This ticket is {selectedTicket.status}.
                  </p>
                  <button onClick={() => handleStatusChange(selectedTicket._id, 'open')} className="text-indigo-600 hover:underline text-xs mt-2 font-medium">Reopen Ticket</button>
                </div>
              ) : (
                <form onSubmit={handleReply} className="flex gap-3">
                  <textarea 
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply here..."
                    className="flex-1 p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none h-12 flex items-center text-sm"
                    rows="1"
                  />
                  <button type="submit" disabled={!replyMessage.trim()} className="bg-indigo-600 text-white px-5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center font-medium shadow-sm">
                    <Send className="w-4 h-4 mr-2" /> Send
                  </button>
                </form>
              )}
              
              {!['closed', 'resolved'].includes(selectedTicket.status) && (
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => handleStatusChange(selectedTicket._id, 'resolved')} className="px-4 py-1.5 text-xs font-bold rounded-lg text-green-700 bg-green-100 hover:bg-green-200 transition-colors">Mark Resolved</button>
                  <button onClick={() => handleStatusChange(selectedTicket._id, 'closed')} className="px-4 py-1.5 text-xs font-bold rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Close Ticket</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
