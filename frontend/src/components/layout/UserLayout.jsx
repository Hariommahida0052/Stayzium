import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { showConfirm } from '../../utils/toastUtils';
import toast from 'react-hot-toast';
import { useContext, useState } from 'react';
import { Home, CalendarCheck, Heart, User, Settings, LogOut, Search, Bell, Menu, X } from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  if (!user || user.role !== 'user') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/user/dashboard', icon: Home },
    { name: 'My Bookings', path: '/user/bookings', icon: CalendarCheck },
    { name: 'Wishlist', path: '/user/wishlist', icon: Heart },
    { name: 'Profile', path: '/user/profile', icon: User },
    { name: 'Settings', path: '/user/settings', icon: Settings },
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
      <aside className={`w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <Link to="/" className="text-2xl font-bold text-primary tracking-tight">Stayzium</Link>
          <button className="md:hidden p-2 text-gray-400 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
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
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 text-red-500" />
            Log out
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
                  placeholder="Search everywhere..."
                  className="block w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <NotificationDropdown />
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.name || 'Customer'}</p>
                <p className="text-xs text-gray-500">Customer</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold border border-primary/30 uppercase">
                {user?.name ? user.name.charAt(0) : 'C'}
              </div>
            </div>
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

export default UserLayout;
