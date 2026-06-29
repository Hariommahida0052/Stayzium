import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Building, MapPin, Tag, LayoutDashboard, User as UserIcon, LogOut, LogIn, UserPlus, CalendarCheck, Heart, Phone } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { showConfirm } from '../../utils/toastUtils';
import toast from 'react-hot-toast';
import ImageLightbox from './ImageLightbox';
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoOpen, setIsLogoOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavWhite = isScrolled || !isHomePage || mobileMenuOpen;

  const navClasses = `w-full z-50 transition-all duration-300 ${
    isHomePage ? 'fixed' : 'sticky top-0'
  } ${
    isNavWhite ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
  }`;

  const textClasses = isNavWhite ? 'text-gray-800' : 'text-white';
  const logoClasses = isNavWhite ? 'text-primary' : 'text-white';

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsLogoOpen(true)}
              className="focus:outline-none flex-shrink-0"
            >
              <img 
                src={process.env.PUBLIC_URL + '/logo.png'} 
                alt="Logo" 
                className="h-12 md:h-16 w-auto object-contain rounded-md shadow-sm hover:opacity-90 transition-opacity cursor-pointer" 
                style={{ imageRendering: 'high-quality' }}
              />
            </button>
            <Link to="/" className={`text-2xl font-bold tracking-tight ${logoClasses} hover:opacity-80 transition-opacity`}>
              Stayzium
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/hotels" className={`font-medium hover:opacity-80 transition-opacity ${textClasses}`}>Hotels</Link>
            <Link to="/destinations" className={`font-medium hover:opacity-80 transition-opacity ${textClasses}`}>Destinations</Link>
            <Link to="/offers" className={`font-medium hover:opacity-80 transition-opacity ${textClasses}`}>Offers</Link>
            <Link to="/contact" className={`font-medium hover:opacity-80 transition-opacity ${textClasses}`}>Contact</Link>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center space-x-6">

            {user ? (
              <div className="relative group">
                <button className={`flex items-center space-x-2 font-medium py-2 ${textClasses}`}>
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm uppercase">
                    {(user.name || 'U').charAt(0)}
                  </div>
                  <span>{user.name || 'User'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0 border border-gray-100">
                  <Link to={`/${user.role}/dashboard`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">Dashboard</Link>
                  {user.role === 'user' && (
                    <>
                      <Link to="/user/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">My Bookings</Link>
                      <Link to="/user/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">Wishlist</Link>
                    </>
                  )}
                  <Link to={`/${user.role}/profile`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">My Profile</Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    onClick={() => {
                      showConfirm('Are you sure you want to log out?', () => {
                        logout();
                        toast.success('Logged out successfully');
                        navigate('/');
                      });
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`font-medium hover:opacity-80 transition-opacity py-2 ${textClasses}`}
                >
                  Log in
                </Link>

                <Link 
                  to="/signup"
                  className={`px-5 py-2.5 rounded-full font-medium transition-all ${
                    isScrolled || !isHomePage 
                      ? 'bg-primary text-white hover:bg-blue-700 shadow-sm' 
                      : 'bg-white text-primary hover:bg-gray-100 shadow-sm'
                  }`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={textClasses}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 z-40 top-[72px]" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Content */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-2xl transition-all duration-300 origin-top transform ${mobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'} z-50 border-t border-gray-100`}>
        <div className="max-h-[85vh] overflow-y-auto pb-6">
          <div className="flex flex-col px-4 py-4 space-y-1">
            <Link to="/hotels" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
              <Building className="w-5 h-5 mr-3 text-gray-400" /> Hotels
            </Link>
            <Link to="/destinations" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
              <MapPin className="w-5 h-5 mr-3 text-gray-400" /> Destinations
            </Link>
            <Link to="/offers" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
              <Tag className="w-5 h-5 mr-3 text-gray-400" /> Offers
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3.5 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
              <Phone className="w-5 h-5 mr-3 text-gray-400" /> Contact
            </Link>
          </div>

          <div className="px-6 py-2">
            <div className="h-px bg-gray-100 w-full"></div>
          </div>

          {user ? (
            <div className="px-4 py-2">
              <div className="flex items-center px-4 py-3 mb-2 bg-gray-50 rounded-xl mx-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20 uppercase text-xl mr-4 shadow-sm">
                  {(user.name || 'U').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role} Account</p>
                </div>
              </div>
              <div className="flex flex-col space-y-1 mt-3">
                <Link to={`/${user.role}/dashboard`} onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
                  <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400" /> Dashboard
                </Link>
                {user.role === 'user' && (
                  <>
                    <Link to="/user/bookings" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
                      <CalendarCheck className="w-5 h-5 mr-3 text-gray-400" /> My Bookings
                    </Link>
                    <Link to="/user/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
                      <Heart className="w-5 h-5 mr-3 text-gray-400" /> Wishlist
                    </Link>
                  </>
                )}
                <Link to={`/${user.role}/profile`} onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-primary rounded-xl font-medium transition-colors">
                  <UserIcon className="w-5 h-5 mr-3 text-gray-400" /> My Profile
                </Link>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    showConfirm('Are you sure you want to log out?', () => {
                      logout();
                      toast.success('Logged out successfully');
                      navigate('/');
                    });
                  }}
                  className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors mt-2"
                >
                  <LogOut className="w-5 h-5 mr-3 text-red-500" /> Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="px-8 py-6 flex flex-col space-y-3">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full px-4 py-3.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl font-semibold transition-colors">
                <LogIn className="w-5 h-5 mr-2" /> Log in
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full px-4 py-3.5 text-white bg-primary hover:bg-blue-700 rounded-xl font-semibold shadow-md transition-all">
                <UserPlus className="w-5 h-5 mr-2" /> Create Account
              </Link>
            </div>
          )}
        </div>
      </div>

      <ImageLightbox 
        isOpen={isLogoOpen}
        images={[process.env.PUBLIC_URL + '/logo.png']}
        currentIndex={0}
        onClose={() => setIsLogoOpen(false)}
        title="Stayzium Logo"
      />
    </nav>
  );
};

export default Navbar;
