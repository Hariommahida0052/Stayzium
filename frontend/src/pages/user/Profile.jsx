import React, { useState, useEffect, useRef, useContext } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Camera, Edit2, Save, X, Lock, Calendar, Heart, Clock, Settings, Bell, BookOpen, Shield, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import userService from '../../services/userService';
import uploadService from '../../services/uploadService';
import toast from 'react-hot-toast';

const Profile = () => {

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

  const [stats, setStats] = useState({
     bookings: 0,
     wishlist: 0
  });

  const [recentActivity, setRecentActivity] = useState([
     { action: 'Account Login', time: 'Just now', icon: Clock }
  ]);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

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

  const fetchStats = async () => {
     try {
        const res = await userService.getDashboardStats();
        if (res.data.success) {
           const d = res.data.data;
           setStats({
              bookings: d.pastBookings + d.upcomingTrips,
              wishlist: d.savedPlaces
           });
           
           const activities = [
             { action: 'Account Login', time: 'Just now', icon: Clock }
           ];
           
           if(d.upcomingTrips > 0) {
              activities.push({ action: 'Booking Confirmed', time: 'Recently', icon: BookOpen });
           }
           if(d.savedPlaces > 0) {
              activities.push({ action: 'Added to Wishlist', time: 'Recently', icon: Heart });
           }
           
           setRecentActivity(activities.slice(0, 3));
        }
     } catch (e) {
        console.error('Error fetching stats:', e);
     }
  };

  const handleSave = async () => {
    try {
      const res = await userService.updateProfile(userProfile);
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
        setRecentActivity([{ action: 'Profile Updated', time: 'Just now', icon: Settings }, ...recentActivity].slice(0, 3));
      }
    } catch (error) {
      toast.error('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTogglePreference = async (key) => {
     const newPreferences = {
        ...userProfile.preferences,
        [key]: !userProfile.preferences[key]
     };
     
     setUserProfile(prev => ({ ...prev, preferences: newPreferences }));
     
     try {
        await userService.updateProfile({ preferences: newPreferences });
        setRecentActivity([{ action: 'Preferences Updated', time: 'Just now', icon: Settings }, ...recentActivity].slice(0, 3));
     } catch(e) {
        console.error('Error updating preference', e);
        // revert on failure
        setUserProfile(prev => ({ 
           ...prev, 
           preferences: { ...prev.preferences, [key]: !prev.preferences[key] } 
        }));
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
        setRecentActivity([{ action: 'Password Changed', time: 'Just now', icon: Shield }, ...recentActivity].slice(0, 3));
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
        setRecentActivity([{ action: 'Avatar Updated', time: 'Just now', icon: Camera }, ...recentActivity].slice(0, 3));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading profile picture');
    }
  };

  return (
    <div className="w-full space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Personal Information</h1>
        <p className="text-gray-600 mt-1">Manage your personal details and how we can reach you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 hover:shadow-md transition-shadow duration-300 flex flex-col">
            {/* Header & Avatar */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-5 mb-5 pb-5 border-b border-gray-100">
              <div className="relative">
                {userProfile.profilePicture ? (
                  <img src={userProfile.profilePicture} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold border-4 border-white shadow-md uppercase hover:scale-105 transition-transform">
                    {userProfile.name ? userProfile.name.charAt(0) : 'U'}
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-blue-600 transition-colors border border-gray-100">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{userProfile.name || 'User'}</h2>
                <p className="text-gray-500 mt-1">{userProfile.email || 'Email not provided'}</p>
                <span className="inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 capitalize">
                  Customer Account
                </span>
              </div>
              {isEditing ? (
                <div className="flex gap-2 w-full md:w-auto">
                  <button onClick={handleSave} className="flex-1 md:flex-none justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </button>
                  <button onClick={() => { setIsEditing(false); fetchProfile(); }} className="flex-1 md:flex-none justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </button>
                  <button onClick={() => setIsEditing(true)} className="justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center">
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
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required value={passwords.currentPassword} onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required minLength={6} value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required minLength={6} value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} className="w-full pl-3 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Personal Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                  {isEditing ? (
                    <input type="text" value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  ) : (
                    <div className="flex items-center text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium">{userProfile.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Age</label>
                  {isEditing ? (
                    <input type="number" min="18" value={userProfile.age} onChange={(e) => setUserProfile({...userProfile, age: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  ) : (
                    <div className="flex items-center text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium">{userProfile.age || 'Not provided'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                  {isEditing ? (
                    <select value={userProfile.gender} onChange={(e) => setUserProfile({...userProfile, gender: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <div className="flex items-center text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium">{userProfile.gender}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Contact Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                  {isEditing ? (
                    <input type="email" value={userProfile.email} onChange={(e) => setUserProfile({...userProfile, email: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  ) : (
                    <div className="flex items-center text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium">{userProfile.email || 'Not provided'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input type="tel" value={userProfile.contactNumber} onChange={(e) => setUserProfile({...userProfile, contactNumber: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  ) : (
                    <div className="flex items-center text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium">{userProfile.contactNumber || 'Not provided'}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  {isEditing ? (
                    <input type="text" value={userProfile.address} onChange={(e) => setUserProfile({...userProfile, address: e.target.value})} className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  ) : (
                    <div className="flex items-center text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-medium">{userProfile.address || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Preferences moved to left column to balance height */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2">Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Bell className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                      <p className="text-xs text-gray-500">Booking updates</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={userProfile.preferences.emailNotifications}
                      onChange={() => handleTogglePreference('emailNotifications')}
                    />
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
                      <p className="text-xs text-gray-500">Secure account</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={userProfile.preferences.twoFactorAuth}
                      onChange={() => handleTogglePreference('twoFactorAuth')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Side Content Area */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.bookings}</p>
                <p className="text-xs text-gray-600 font-medium uppercase mt-1">Bookings</p>
              </div>
              <div className="p-4 bg-pink-50 rounded-xl text-center">
                <Heart className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.wishlist}</p>
                <p className="text-xs text-gray-600 font-medium uppercase mt-1">Wishlist</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Recent Activity</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {recentActivity.map((activity, idx) => (
                 <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                   <div className="flex items-center justify-center w-7 h-7 rounded-full border border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                     <activity.icon className="w-3 h-3" />
                   </div>
                   <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm ml-4 md:ml-0">
                     <div className="flex flex-col">
                       <span className="text-sm font-semibold text-gray-900">{activity.action}</span>
                       <span className="text-xs text-gray-500">{activity.time}</span>
                     </div>
                   </div>
                 </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
