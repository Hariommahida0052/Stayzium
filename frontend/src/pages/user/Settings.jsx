import React, { useState, useEffect } from 'react';
import { Bell, Shield, Key, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import userService from '../../services/userService';

const Settings = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    promotionalOffers: false,
    twoFactorAuth: false
  });
  const [loading, setLoading] = useState(true);

  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '', loading: false });
  const [showPassword, setShowPassword] = useState(false);

  // Notifications State
  const [prefStatus, setPrefStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.data.success) {
        const prefs = res.data.user.preferences || {};
        setPreferences({
          emailNotifications: prefs.emailNotifications !== false,
          promotionalOffers: prefs.promotionalOffers || false,
          twoFactorAuth: prefs.twoFactorAuth || false
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = async (key) => {
    const newValue = !preferences[key];
    setPreferences(prev => ({ ...prev, [key]: newValue }));
    setPrefStatus({ type: '', message: '' });

    try {
      await userService.updateProfile({ preferences: { ...preferences, [key]: newValue } });
      setPrefStatus({ type: 'success', message: 'Preference updated successfully!' });
      setTimeout(() => setPrefStatus({ type: '', message: '' }), 3000);
    } catch (error) {
      console.error('Error updating preference', error);
      // Revert if failed
      setPreferences(prev => ({ ...prev, [key]: !newValue }));
      setPrefStatus({ type: 'error', message: 'Failed to update preference.' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match!', loading: false });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.', loading: false });
      return;
    }

    setPasswordStatus({ type: '', message: '', loading: true });

    try {
      const res = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully!', loading: false });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => {
          setShowPasswordForm(false);
          setPasswordStatus({ type: '', message: '', loading: false });
        }, 2000);
      }
    } catch (error) {
      setPasswordStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update password. Please try again.', 
        loading: false 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security.</p>
      </div>

      {prefStatus.message && (
        <div className={`p-4 rounded-xl flex items-center ${prefStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {prefStatus.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
          {prefStatus.message}
        </div>
      )}

      <div className="space-y-6">
        {/* Security Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-lg font-bold text-gray-900">Security & Password</h2>
          </div>
          <div className="ml-9 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500 mt-1">Update your password to keep your account secure</p>
              </div>
              <button 
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-colors border ${showPasswordForm ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {showPasswordForm ? 'Cancel' : 'Update Password'}
              </button>
            </div>

            {/* Password Form Expansion */}
            {showPasswordForm && (
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-4 animate-in fade-in slide-in-from-top-2">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="flex items-center text-primary font-medium mb-2">
                    <Key className="w-5 h-5 mr-2" /> Change Password
                  </div>
                  
                  {passwordStatus.message && (
                    <div className={`p-3 rounded-lg text-sm flex items-center ${passwordStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {passwordStatus.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                      {passwordStatus.message}
                    </div>
                  )}

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                        placeholder="Enter current password"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          minLength="6"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                          placeholder="Min 6 characters"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          required
                          minLength="6"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                          placeholder="Confirm password"
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={passwordStatus.loading}
                      className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {passwordStatus.loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Save New Password
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.twoFactorAuth}
                  onChange={() => handleTogglePreference('twoFactorAuth')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="ml-9 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500 mt-1">Receive emails about your bookings and account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.emailNotifications}
                  onChange={() => handleTogglePreference('emailNotifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Promotional Offers</p>
                <p className="text-sm text-gray-500 mt-1">Receive exclusive travel deals and promotions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={preferences.promotionalOffers}
                  onChange={() => handleTogglePreference('promotionalOffers')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
