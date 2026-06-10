import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, ShieldCheck, Save, Camera, Lock, Edit2, X, Phone, Calendar, MapPin, Users, DollarSign, Server, Shield, Clock, FileText } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

import userService from '../../services/userService';
import uploadService from '../../services/uploadService';
import analyticsService from '../../services/analyticsService';

const AdminProfile = () => {

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: 'admin',
    contactNumber: '',
    address: '',
    age: '',
    gender: 'Prefer not to say',
    profilePicture: ''
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [systemStats, setSystemStats] = useState({ totalUsers: 0, revenue: 0, status: 'Checking...' });
  const [recentLogs, setRecentLogs] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const [summaryRes, healthRes] = await Promise.all([
        analyticsService.getAdminSummary(),
        analyticsService.getSystemHealth()
      ]);
      
      let users = 0;
      let rev = 0;
      let logs = [];
      if (summaryRes?.data?.success) {
        users = summaryRes.data.data.totalUsers || 0;
        rev = summaryRes.data.data.platformRevenue || 0;
        logs = summaryRes.data.data.recentActivity || [];
      }
      
      let status = 'Healthy';
      if (healthRes?.data?.success) {
        const { databaseStatus, errorRate } = healthRes.data.data;
        if (databaseStatus !== 'Operational' || parseFloat(errorRate) > 5) {
          status = 'Degraded';
        }
      }

      setSystemStats({ totalUsers: users, revenue: rev, status });
      setRecentLogs(logs);
    } catch (err) {
      console.error('Error fetching system data', err);
      setSystemStats(prev => ({ ...prev, status: 'Error' }));
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      if (res.data.success) {
        const u = res.data.user;
        setProfile({
          name: u.name || '',
          email: u.email || '',
          role: u.role || 'admin',
          contactNumber: u.contactNumber || '',
          address: u.address || '',
          age: u.age || '',
          gender: u.gender || 'Prefer not to say',
          profilePicture: u.profilePicture || ''
        });
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await userService.updateProfile(profile);
      if (res.data.success) {
        toast.success('Admin profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      toast.error('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
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
        setProfile(prev => ({ ...prev, profilePicture: url }));
        await userService.updateProfile({ ...profile, profilePicture: url });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading profile picture');
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-gray-600 mt-1">Manage your administrator account settings and personal information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-5 pb-5 border-b border-gray-100">
              <div className="relative">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md uppercase hover:scale-105 transition-transform">
                      {profile.name ? profile.name.charAt(0) : 'A'}
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                  <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full text-gray-600 hover:text-indigo-600 shadow-sm border border-gray-100">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center">
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
                      <input type="password" required value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <input type="password" required minLength={8} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <input type="password" required minLength={8} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">Update Password</button>
                      <button type="button" onClick={() => setIsChangingPassword(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Admin Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{profile.name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                    <div className="flex items-center text-gray-900 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                      <ShieldCheck className="w-5 h-5 mr-3" />
                      <span className="font-medium capitalize">{profile.role}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">System roles cannot be modified.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                      {isEditing ? (
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input type="number" min="18" value={profile.age} onChange={e => setProfile({...profile, age: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="font-medium">{profile.age || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      {isEditing ? (
                        <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value})} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <span className="font-medium">{profile.gender}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Contact Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{profile.email || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="tel" value={profile.contactNumber} onChange={e => setProfile({...profile, contactNumber: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{profile.contactNumber || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location / Branch</label>
                    {isEditing ? (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input type="text" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-900 px-3 py-2 bg-gray-50 rounded-lg">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="font-medium">{profile.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>

        {/* Side Content Area */}
        <div className="lg:col-span-4 space-y-6">
          {/* System Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">System Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-gray-600 font-medium uppercase mt-1">Total Users</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <DollarSign className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">₹{systemStats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-xs text-gray-600 font-medium uppercase mt-1">Revenue</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-medium text-gray-900">System Status</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${systemStats.status === 'Healthy' ? 'bg-emerald-100 text-emerald-700' : systemStats.status === 'Error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${systemStats.status === 'Healthy' ? 'bg-emerald-500' : systemStats.status === 'Error' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                {systemStats.status}
              </span>
            </div>
          </div>

          {/* Security & Access was moved to left column */}

          {/* Recent Admin Logs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Recent Logs</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {recentLogs.length > 0 ? recentLogs.slice(0, 5).map((log, index) => (
                <div key={log._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full border border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${index % 2 === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
                    {index % 2 === 0 ? <FileText className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm ml-4 md:ml-0 relative z-20">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">{log.title}</span>
                      {log.description && <span className="text-xs text-gray-600 mt-0.5">{log.description}</span>}
                      <span className="text-xs text-gray-500 mt-1">{log.time}</span>
                    </div>
                  </div>
                </div>
              )) : (
                 <div className="text-center text-gray-500 text-sm py-4 relative z-20">No recent activity</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
