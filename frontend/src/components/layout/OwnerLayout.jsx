import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { showConfirm } from '../../utils/toastUtils';
import toast from 'react-hot-toast';
import { useContext, useState } from 'react';
import { LayoutDashboard, Building2, BedDouble, CalendarDays, BarChart3, LogOut, Bell, Search, Menu, X, Wallet } from 'lucide-react';
import NotificationDropdown from '../common/NotificationDropdown';

const OwnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  if (!user || user.role !== 'owner') {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
    { name: 'My Hotels', path: '/owner/hotels', icon: Building2 },
    { name: 'Rooms', path: '/owner/rooms', icon: BedDouble },
    { name: 'Bookings', path: '/owner/bookings', icon: CalendarDays },
    { name: 'My Wallet', path: '/owner/wallet', icon: Wallet },
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
            Stayzium <span className="text-sm font-normal text-indigo-400 ml-2 mt-1">For Owners</span>
          </Link>
          <button className="md:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-2">Manage</p>
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
        </div>

        <div className="p-4 border-t border-gray-800 bg-slate-950">
          <Link to="/owner/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-4 mb-4 hover:bg-slate-800 rounded-xl p-2 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-indigo-900/50 text-indigo-400 flex items-center justify-center font-bold border border-indigo-800/50 uppercase">
              {user?.name ? user.name.charAt(0) : 'O'}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Owner'}</p>
              <p className="text-xs text-gray-500">Owner Account</p>
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
                  placeholder="Search bookings, properties..."
                  className="block w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
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

export default OwnerLayout;
