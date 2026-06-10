import React, { useState, useEffect } from 'react';
import { Mail, Users, Send, CheckCircle2, Clock, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const AdminNewsletter = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/newsletter/subscribers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setSubscribers(data.data);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail) return toast.error('Please enter an email address');

    try {
      setAddingEmail(true);
      const { data } = await axios.post('/newsletter/subscribe', { email: newEmail });
      if (data.success) {
        toast.success('Subscriber added successfully!');
        setNewEmail('');
        fetchSubscribers(); // Refresh list
      }
    } catch (error) {
      console.error('Error adding subscriber:', error);
      toast.error(error.response?.data?.message || 'Failed to add subscriber');
    } finally {
      setAddingEmail(false);
    }
  };

  const handleRemoveSubscriber = async (id) => {
    showConfirm('Are you sure you want to remove this subscriber?', async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.delete(`/newsletter/subscribers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          toast.success('Subscriber removed successfully!');
          setSubscribers(subscribers.filter(sub => sub._id !== id));
        }
      } catch (error) {
        console.error('Error removing subscriber:', error);
        toast.error('Failed to remove subscriber');
      }
    });
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      return toast.error('Please provide a subject and message.');
    }

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      const { data } = await axios.post('/newsletter/send', { subject, message }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message || 'Newsletter sent successfully!');
        setSubject('');
        setMessage('');
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Failed to send newsletter');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
        <p className="text-gray-500 mt-1">Manage subscribers and send promotional emails.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Newsletter Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Send className="w-5 h-5 mr-2 text-indigo-600" /> Compose Newsletter
            </h2>
          </div>
          <form onSubmit={handleSendNewsletter} className="p-6 flex-1 flex flex-col space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <input 
                type="text" 
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                placeholder="e.g., Exclusive Summer Deals! 🏖️"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
              <p className="text-xs text-gray-500 mb-2">This will be wrapped in our beautifully designed HTML template automatically.</p>
              <textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="8"
                className="w-full flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                placeholder="Write your promotional message here..."
              ></textarea>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={sending}
                className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" /> Send to All Subscribers
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Subscribers List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600" /> Subscribers
            </h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
              {subscribers.length}
            </span>
          </div>
          
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleAddSubscriber} className="flex gap-2">
              <input 
                type="email" 
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Add new email..."
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              />
              <button 
                type="submit"
                disabled={addingEmail}
                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex justify-center items-center h-full text-gray-500">Loading subscribers...</div>
            ) : subscribers.length === 0 ? (
              <div className="flex justify-center items-center h-full text-gray-500 flex-col">
                <Mail className="w-8 h-8 text-gray-300 mb-2" />
                <p>No subscribers yet.</p>
              </div>
            ) : (
              subscribers.map((sub) => (
                <div key={sub._id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors group">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                      {sub.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{sub.email}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Clock className="w-3 h-3 mr-1" /> {new Date(sub.subscribedAt || sub.createdAt || new Date()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveSubscriber(sub._id)}
                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                    title="Remove Subscriber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNewsletter;
