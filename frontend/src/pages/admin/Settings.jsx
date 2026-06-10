import React, { useState, useEffect } from 'react';
import { Save, Shield, Briefcase, FileText } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('business');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState({
    globalCommissionRate: 10,
    maxAdvanceBookingDays: 365,
    requireHotelApproval: true,
    requireOwnerVerification: true,
    maintenanceMode: false,
    cancellationPolicy: 'Free cancellation up to 48 hours before check-in. After that, a cancellation fee of 1 night will apply.'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success && data.data) {
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
      toast.error('Failed to load platform settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.put('/settings', settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        setIsSaved(true);
        toast.success('Settings saved successfully!');
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Manage core business rules, approvals, and platform policies.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row overflow-hidden">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-4">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('business')}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'business' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/60' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Briefcase className={`w-4 h-4 mr-3 ${activeTab === 'business' ? 'text-indigo-600' : 'text-gray-400'}`} /> Business Rules
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/60' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Shield className={`w-4 h-4 mr-3 ${activeTab === 'security' ? 'text-indigo-600' : 'text-gray-400'}`} /> Approvals & Security
            </button>
            <button 
              onClick={() => setActiveTab('policies')}
              className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${activeTab === 'policies' ? 'bg-white text-indigo-600 shadow-sm border border-gray-200/60' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <FileText className={`w-4 h-4 mr-3 ${activeTab === 'policies' ? 'text-indigo-600' : 'text-gray-400'}`} /> Policies
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'business' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Business Rules</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Global Commission Rate (%)</label>
                  <p className="text-xs text-gray-500 mb-2">The percentage the platform takes from each booking.</p>
                  <input 
                    type="number" 
                    name="globalCommissionRate"
                    value={settings.globalCommissionRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full md:max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  />
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Advance Booking (Days)</label>
                  <p className="text-xs text-gray-500 mb-2">How far in the future users are allowed to book a hotel.</p>
                  <input 
                    type="number" 
                    name="maxAdvanceBookingDays"
                    value={settings.maxAdvanceBookingDays}
                    onChange={handleChange}
                    min="1"
                    className="w-full md:max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Approvals & Security</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Require Hotel Approval</h4>
                    <p className="text-xs text-gray-500 mt-0.5">When enabled, newly created hotels stay pending until an Admin approves them.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="requireHotelApproval"
                      checked={settings.requireHotelApproval}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Require Owner Verification</h4>
                    <p className="text-xs text-gray-500 mt-0.5">When enabled, owners must be manually verified by an Admin.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="requireOwnerVerification"
                      checked={settings.requireOwnerVerification}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-red-600">Maintenance Mode</h4>
                    <p className="text-xs text-red-500 mt-0.5">Disables public access to the platform. Only Admins can log in.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onChange={handleChange}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Platform Policies</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Global Cancellation Policy</label>
                  <p className="text-xs text-gray-500 mb-2">This text will be displayed to users when they book a hotel.</p>
                  <textarea 
                    name="cancellationPolicy"
                    value={settings.cancellationPolicy}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none" 
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
            {isSaved && <span className="text-green-600 text-sm font-medium mr-4">Settings saved successfully!</span>}
            <button 
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
