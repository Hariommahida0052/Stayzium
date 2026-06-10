import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, X, Clock, Info, Check, Trash2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { socket } = useSocket();
  const { user } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle incoming socket notifications
  useEffect(() => {
    if (socket) {
      const handleNewNotification = (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        // Optional: Play a sound here
      };

      socket.on('newNotification', handleNewNotification);

      return () => {
        socket.off('newNotification', handleNewNotification);
      };
    }
  }, [socket]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const clearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/notifications/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications([]);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'hotel': return <Info className="w-5 h-5 text-blue-500" />;
      case 'system': return <Clock className="w-5 h-5 text-purple-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 border-2 border-white rounded-full"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Mark all as read">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Clear all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                    <Bell className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-1">We'll let you know when something arrives!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div 
                      key={notif._id}
                      onClick={() => handleNotifClick(notif)}
                      className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                          {getIcon(notif.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold mb-0.5 ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" /> {getTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full flex-shrink-0 shadow-sm shadow-indigo-500/50"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  View all activity
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
