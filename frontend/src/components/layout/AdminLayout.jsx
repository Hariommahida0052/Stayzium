import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { showConfirm } from '../../utils/toastUtils';
import toast from 'react-hot-toast';
import { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Users, Building2, CalendarDays, Settings, LogOut, Search, ShieldCheck, Check, Menu, X, Tag, MessageSquare, AlertTriangle, Mail, DollarSign } from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }


  const searchablePages = [
    { name: 'Overview / Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users Management', path: '/admin/users', icon: Users },
    { name: 'Hotels & Properties', path: '/admin/hotels', icon: Building2 },
    { name: 'Bookings & Reservations', path: '/admin/bookings', icon: CalendarDays },
    { name: 'Reports & Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Offers & Coupons', path: '/admin/offers', icon: Tag },
    { name: 'Newsletter Management', path: '/admin/newsletter', icon: Mail },
    { name: 'Owner Payouts', path: '/admin/payouts', icon: DollarSign },
    { name: 'System / Platform Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admin Profile', path: '/admin/profile', icon: ShieldCheck },
  ];

  const filteredPages = searchablePages.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };
  
  const handleResultClick = (path) => {
    navigate(path);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Hotels', path: '/admin/hotels', icon: Building2 },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
    { name: 'Offers', path: '/admin/offers', icon: Tag },
    { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
    { name: 'Payouts', path: '/admin/payouts', icon: DollarSign },
  ];

  const handleLogout = () => {
    showConfirm('Are you sure you want to log out?', () => {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed h-full z-30 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-indigo-500" /> Stayzium <span className="text-sm font-normal text-indigo-400 ml-1 mt-1">Admin</span>
          </Link>
          <button className="md:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2">Overview</p>
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}

          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-8">System</p>
          <Link to="/admin/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5 mr-3 text-slate-400" />
            Platform Settings
          </Link>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <Link to="/admin/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 mb-4 hover:bg-slate-800 rounded-xl p-2 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-indigo-900/50 text-indigo-400 flex items-center justify-center font-bold border border-indigo-800/50">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Super Admin</p>
              <p className="text-xs text-slate-500">System Manager</p>
            </div>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 rounded-xl hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex-1 flex items-center">
            <button 
              className="md:hidden mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-full max-w-md hidden sm:flex flex-col relative z-50">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => { if(searchTerm) setShowDropdown(true); }}
                  placeholder="Search pages (e.g. Users, Hotels, Settings)..."
                  className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
              
              {/* Search Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="p-2">
                    {filteredPages.length > 0 ? (
                      filteredPages.map((page, idx) => {
                        const Icon = page.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleResultClick(page.path)}
                            className="w-full flex items-center px-4 py-3 text-sm text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                          >
                            <Icon className="w-4 h-4 mr-3 text-gray-400" />
                            {page.name}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No pages found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 relative">
            <NotificationDropdown />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
