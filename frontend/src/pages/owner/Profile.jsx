import React, { useState, useEffect, useRef } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Camera, Edit2, Save, X, Lock, Calendar, Building, DollarSign, Activity, Settings, Bell, Shield, ArrowRight } from 'lucide-react';
import userService from '../../services/userService';
import uploadService from '../../services/uploadService';
import analyticsService from '../../services/analyticsService';
import toast from 'react-hot-toast';

const OwnerProfile = () => {

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    age: '',
    gender: 'Prefer not to say',
    profilePicture: '',
    preferences: {
      emailNotifications: true,
      twoFactorAuth: false
    }
  });

  const [analytics, setAnalytics] = useState({
    totalProperties: 0,
    totalBookings: 0,
    ownerRevenue: 0,
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await analyticsService.getOwnerSummary();
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.data.success) {
        const u = res.data.user;
        setUserProfile({
          name: u.name || '',
          email: u.email || '',
          contactNumber: u.contactNumber || '',
          address: u.address || '',
          age: u.age || '',
          gender: u.gender || 'Prefer not to say',
          profilePicture: u.profilePicture || '',
          preferences: u.preferences || { emailNotifications: true, twoFactorAuth: false }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await userService.updateProfile(userProfile);
      if (res.data.success) {
        toast.success('Owner profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      toast.error('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const updatePreferences = async (newPrefs, successMessage) => {
    try {
      const res = await userService.updateProfile({ preferences: newPrefs });
      if (res.data.success) {
        setUserProfile(prev => ({ ...prev, preferences: res.data.user.preferences }));
        toast.success(successMessage || 'Preferences updated successfully!');
      }
    } catch (error) {
      toast.error('Error updating preferences');
    }
  };

  const handleToggleAlerts = () => {
    const newState = !userProfile.preferences?.emailNotifications;
    const newPrefs = { ...userProfile.preferences, emailNotifications: newState };
    setUserProfile(prev => ({ ...prev, preferences: newPrefs }));
    updatePreferences(newPrefs, `Booking Alerts ${newState ? 'Enabled' : 'Disabled'}`);
  };

  const handleToggle2FA = () => {
    const newState = !userProfile.preferences?.twoFactorAuth;
    const newPrefs = { ...userProfile.preferences, twoFactorAuth: newState };
    setUserProfile(prev => ({ ...prev, preferences: newPrefs }));
    updatePreferences(newPrefs, `Two-Factor Authentication ${newState ? 'Enabled' : 'Disabled'}`);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    try {
      const res = await userService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error('Error changing password: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await uploadService.uploadImage(formData);
      
      if (res.data.success) {
        const url = res.data.data.url;
        setUserProfile(prev => ({ ...prev, profilePicture: url }));
        await userService.updateProfile({ ...userProfile, profilePicture: url });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading profile picture');
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Owner Profile</h1>
        <p className="text-gray-600 mt-1">Manage your business account and contact information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-5 pb-5 border-b border-gray-100">
              <div className="relative">
                {userProfile.profilePicture ? (
                  <img src={userProfile.profilePicture} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md uppercase hover:scale-105 transition-transform">
                      {userProfile.name ? userProfile.name.charAt(0) : 'O'}
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full text-gray-600 hover:text-blue-600 shadow-sm border border-gray-100">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center">
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 ml-auto">
                    <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      Password
                    </button>
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>

              {isChangingPassword && (
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" required minLength={8} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input type="password" required minLength={8} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Update Password</button>
                      <button type="button" onClick={() => setIsChangingPassword(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Business & Personal Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner / Display Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={userProfile.name} onChange={e => setUserProfile({...userProfile, name: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{userProfile.name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                    {isEditing ? (
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="number" min="18" value={userProfile.age} onChange={e => setUserProfile({...userProfile, age: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{userProfile.age || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    {isEditing ? (
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select value={userProfile.gender} onChange={e => setUserProfile({...userProfile, gender: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{userProfile.gender}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Contact Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="email" value={userProfile.email} onChange={e => setUserProfile({...userProfile, email: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{userProfile.email || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="tel" value={userProfile.contactNumber} onChange={e => setUserProfile({...userProfile, contactNumber: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{userProfile.contactNumber || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={userProfile.address} onChange={e => setUserProfile({...userProfile, address: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{userProfile.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
              </div>
            </div>

            {/* Settings & Preferences moved to left column to balance height */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2">Settings & Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Bell className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Booking Alerts</p>
                      <p className="text-xs text-gray-500">Instant notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={userProfile.preferences?.emailNotifications || false} onChange={handleToggleAlerts} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Shield className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Two-Factor Auth</p>
                      <p className="text-xs text-gray-500">Secure your business</p>
                    </div>
                  </div>
                  <button onClick={handleToggle2FA} className={`text-sm font-medium ${userProfile.preferences?.twoFactorAuth ? 'text-red-600 hover:text-red-700' : 'text-blue-600 hover:text-blue-700'}`}>
                    {userProfile.preferences?.twoFactorAuth ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Side Content Area */}
        <div className="lg:col-span-4 space-y-6">
          {/* Business Performance */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Business Performance</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-indigo-50 rounded-xl text-center">
                <Building className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{analytics.totalProperties || 0}</p>
                <p className="text-xs text-gray-600 font-medium uppercase mt-1">Properties</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <DollarSign className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">₹{Number(analytics.ownerRevenue || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-600 font-medium uppercase mt-1">Revenue</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Total Bookings</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{analytics.totalBookings || 0}</span>
            </div>
          </div>

          {/* Settings section was moved to left column */}

          {/* Recent Payouts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Recent Payouts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    {analytics.ownerRevenue > 0 ? (
                       <>
                         <p className="text-sm font-semibold text-gray-900">Recent payout cleared</p>
                         <p className="text-xs text-gray-500">Keep up the great work!</p>
                       </>
                    ) : (
                       <>
                         <p className="text-sm font-semibold text-gray-900">No recent payouts</p>
                         <p className="text-xs text-gray-500">Start hosting to earn</p>
                       </>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default OwnerProfile;
