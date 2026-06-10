import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Star, Shield, Clock, Heart, Mail, ChevronRight, Search, Building2, CreditCard, CheckCircle2, Plus, Minus, Bell } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import hotelService from '../../services/hotelService';
import newsletterService from '../../services/newsletterService';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Toast from '../../components/ui/Toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const Home = () => {
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(0);
  const [searchParams, setSearchParams] = useState({
    location: '',
    dates: '12 Aug - 18 Aug',
    guests: '2 Adults, 0 Children, 1 Room'
  });
  
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [isGuestPopupOpen, setIsGuestPopupOpen] = useState(false);
  const [guestsConfig, setGuestsConfig] = useState({ adults: 2, children: 0, rooms: 1 });

  useEffect(() => {
    if (startDate && endDate) {
      setSearchParams(prev => ({
        ...prev,
        dates: `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`
      }));
    } else if (startDate) {
      setSearchParams(prev => ({
        ...prev,
        dates: `${format(startDate, 'dd MMM yyyy')} - Check-out`
      }));
    } else {
      setSearchParams(prev => ({
        ...prev,
        dates: `Check-in - Check-out`
      }));
    }
  }, [startDate, endDate]);

  useEffect(() => {
    setSearchParams(prev => ({
      ...prev,
      guests: `${guestsConfig.adults} Adults, ${guestsConfig.children} Children, ${guestsConfig.rooms} Room${guestsConfig.rooms > 1 ? 's' : ''}`
    }));
  }, [guestsConfig.adults, guestsConfig.children, guestsConfig.rooms]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setIsSubscribing(true);
      try {
        const res = await newsletterService.subscribe(newsletterEmail);
        if (res.data.success) {
          setToastType('success');
          setToastMessage('Subscription successful! Check your email inbox.');
          setNewsletterEmail('');
        }
      } catch (error) {
        console.error('Subscription error:', error);
        setToastType('error');
        setToastMessage(error.response?.data?.message || 'Failed to subscribe. Please try again.');
      }
      setIsSubscribing(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const backgroundImages = [
    '/images/hero_bg.png',
    'https://images.unsplash.com/photo-1542314831-c53cd3b82142?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1920&q=80'
  ];

  // Rotate background images every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  const handleSearch = (e) => {
    e.preventDefault();
    let query = `?search=${encodeURIComponent(searchParams.location)}`;
    if (startDate && endDate) {
      query += `&in=${startDate.toISOString()}&out=${endDate.toISOString()}`;
    }
    query += `&adults=${guestsConfig.adults}&children=${guestsConfig.children}&rooms=${guestsConfig.rooms}`;
    navigate(`/hotels${query}`);
  };

  const featuredDestinations = [
    { name: 'Ahmedabad, Gujarat', image: '/images/heritage.png', properties: 1240 },
    { name: 'Kutch, Gujarat', image: '/images/kutch.png', properties: 850 },
    { name: 'Sasan Gir, Gujarat', image: '/images/gir.png', properties: 420 },
    { name: 'Statue of Unity, Kevadia', image: '/images/room.png', properties: 210 },
  ];

  const [popularHotels, setPopularHotels] = useState([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelService.getAllHotels();
        if (res.data.success) {
          // Take first 3 hotels as popular
          setPopularHotels(res.data.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };
    fetchHotels();
  }, []);

  const features = [
    { icon: Shield, title: 'Secure Booking', desc: 'Your payments are secure with our encrypted payment system.' },
    { icon: Bell, title: 'Real-time Updates', desc: 'Get instant notifications on your bookings and approvals directly on the platform.' },
    { icon: Heart, title: 'Best Price Guarantee', desc: 'Find a lower price? We will match it and give you a discount.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[85vh] min-h-[600px] flex items-center justify-center">
        {/* Background Images Wrapper */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <AnimatePresence initial={false}>
            <motion.div 
              key={currentBg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${backgroundImages[currentBg]}')` }}
            />
          </AnimatePresence>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-6"
          >
            Find your next stay
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium"
          >
            Search low prices on hotels, homes and much more...
          </motion.p>

          {/* Search Widget */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-5xl mx-auto bg-white p-2 md:p-3 rounded-2xl shadow-2xl"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative flex items-center bg-gray-100/50 hover:bg-gray-100 rounded-xl transition-colors">
                <MapPin className="absolute left-4 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Where are you going?"
                  className="w-full bg-transparent py-4 pl-12 pr-4 font-medium text-gray-900 outline-none placeholder-gray-500 rounded-xl"
                  value={searchParams.location}
                  onChange={(e) => setSearchParams({...searchParams, location: e.target.value})}
                />
              </div>
              <div className="flex-1 relative flex items-center bg-gray-100/50 hover:bg-gray-100 rounded-xl transition-colors">
                <Calendar className="absolute left-4 text-gray-400 w-5 h-5 z-10 pointer-events-none" />
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  minDate={new Date()}
                  placeholderText="Check-in - Check-out"
                  className="w-full bg-transparent py-4 pl-12 pr-4 font-medium text-gray-900 outline-none placeholder-gray-500 rounded-xl cursor-pointer"
                  wrapperClassName="w-full"
                  dateFormat="dd MMM yyyy"
                />
              </div>

              <div 
                className="flex-1 relative flex items-center bg-gray-100/50 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer" 
                onClick={() => { setIsGuestPopupOpen(!isGuestPopupOpen); }}
              >
                <Users className="absolute left-4 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="e.g. 2 Adults, 0 Children, 1 Room"
                  className="w-full bg-transparent py-4 pl-12 pr-4 font-medium text-gray-900 outline-none placeholder-gray-500 rounded-xl cursor-pointer pointer-events-none text-sm md:text-base"
                  readOnly
                  value={searchParams.guests}
                />
                
                {/* Guest Selection Popup */}
                {isGuestPopupOpen && (
                  <div className="absolute top-full right-0 md:left-0 mt-3 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-5">
                      {/* Adults */}
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">Adults</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">Ages 13 or above</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            type="button"
                            onClick={() => setGuestsConfig(prev => ({...prev, adults: Math.max(1, prev.adults - 1)}))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 disabled:opacity-30 transition-colors"
                            disabled={guestsConfig.adults <= 1}
                          ><Minus className="w-4 h-4" /></button>
                          <span className="w-5 text-center font-bold text-gray-900">{guestsConfig.adults}</span>
                          <button 
                            type="button"
                            onClick={() => setGuestsConfig(prev => ({...prev, adults: prev.adults + 1}))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 transition-colors"
                          ><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex justify-between items-center pt-5 border-t border-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">Children</p>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">Ages 0-12</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            type="button"
                            onClick={() => setGuestsConfig(prev => ({...prev, children: Math.max(0, prev.children - 1)}))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 disabled:opacity-30 transition-colors"
                            disabled={guestsConfig.children <= 0}
                          ><Minus className="w-4 h-4" /></button>
                          <span className="w-5 text-center font-bold text-gray-900">{guestsConfig.children}</span>
                          <button 
                            type="button"
                            onClick={() => setGuestsConfig(prev => ({...prev, children: prev.children + 1}))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 transition-colors"
                          ><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>

                      {/* Rooms */}
                      <div className="flex justify-between items-center pt-5 border-t border-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">Rooms</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button 
                            type="button"
                            onClick={() => setGuestsConfig(prev => ({...prev, rooms: Math.max(1, prev.rooms - 1)}))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 disabled:opacity-30 transition-colors"
                            disabled={guestsConfig.rooms <= 1}
                          ><Minus className="w-4 h-4" /></button>
                          <span className="w-5 text-center font-bold text-gray-900">{guestsConfig.rooms}</span>
                          <button 
                            type="button"
                            onClick={() => setGuestsConfig(prev => ({...prev, rooms: prev.rooms + 1}))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-800 hover:text-gray-800 transition-colors"
                          ><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-gray-100">
                      <button onClick={(e) => { e.stopPropagation(); setIsGuestPopupOpen(false); }} type="button" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
                  <Button 
                    type="submit" 
                    className="h-[60px] md:h-auto px-10 text-lg shadow-[0_8px_16px_-6px_rgba(41,98,255,0.4)]"
                  >
                    Search
                  </Button>
            </form>
          </motion.div>
        </div>
      </div>

      <div className="flex-1">
        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{feature.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Destinations */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Trending Destinations</h2>
              <p className="text-gray-600 mt-2">Most popular choices for customers from worldwide</p>
            </div>
            <button onClick={() => navigate('/destinations')} className="hidden sm:flex items-center text-primary font-medium hover:underline">
              Explore all <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((dest, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="relative rounded-2xl overflow-hidden cursor-pointer group h-72 shadow-md"
                onClick={() => navigate('/hotels')}
              >
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-white text-xl font-bold">{dest.name}</h3>
                  <p className="text-white/80 text-sm mt-1">{dest.properties} properties</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Popular Hotels */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Stay at our top unique properties</h2>
              <p className="text-gray-600 mt-2">From castles and villas to boats and igloos, we have it all</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularHotels.map((hotel, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer" onClick={() => navigate(`/hotels/${hotel._id}`)}>
                <div className="relative h-56 overflow-hidden">
                  <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-bold text-gray-900">4.8</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> {hotel.location?.city}, {hotel.location?.country}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Starting from</p>
                      <p className="text-2xl font-bold text-primary">₹{Number(hotel.pricePerNight).toFixed(2)}<span className="text-sm text-gray-500 font-normal"> / night</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works / User Journey */}
        <div className="bg-white py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Simplified Booking</span>
              <h2 className="text-4xl font-bold text-gray-900">Your Journey in 4 Simple Steps</h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">From finding the perfect property to securing your stay, we've made the entire process seamless and hassle-free.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 relative">
              {/* Connecting Line (Only visible on desktop) */}
              <div className="hidden md:block absolute top-12 left-[10%] w-[80%] h-1 bg-gradient-to-r from-indigo-100 via-indigo-200 to-indigo-100 z-0 rounded-full"></div>
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white rounded-2xl border-4 border-indigo-50 flex items-center justify-center mb-6 shadow-sm group-hover:border-indigo-500 group-hover:-translate-y-2 transition-all duration-300">
                  <Search className="w-10 h-10 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 1</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Search & Filter</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-2">Enter your desired destination, dates, and apply custom filters to discover your perfect hotel or resort.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white rounded-2xl border-4 border-emerald-50 flex items-center justify-center mb-6 shadow-sm group-hover:border-emerald-500 group-hover:-translate-y-2 transition-all duration-300">
                  <Building2 className="w-10 h-10 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 2</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Choose a Room</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-2">Browse through verified property photos, read authentic reviews, and select the room that fits your needs.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white rounded-2xl border-4 border-amber-50 flex items-center justify-center mb-6 shadow-sm group-hover:border-amber-500 group-hover:-translate-y-2 transition-all duration-300">
                  <CreditCard className="w-10 h-10 text-amber-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 3</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Booking</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-2">Provide guest details and confidently complete your reservation using our highly secure payment gateway.</p>
              </div>

              {/* Step 4 */}
              <div className="relative z-10 flex flex-col items-center text-center group">
                <div className="w-24 h-24 bg-white rounded-2xl border-4 border-blue-50 flex items-center justify-center mb-6 shadow-sm group-hover:border-blue-500 group-hover:-translate-y-2 transition-all duration-300">
                  <CheckCircle2 className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3">Step 4</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Confirmation</h3>
                <p className="text-gray-500 text-sm leading-relaxed px-2">Receive your booking confirmation instantly via email and manage it anytime in your user dashboard.</p>
              </div>
            </div>
            
            <div className="mt-16 text-center">
              <button onClick={() => navigate('/hotels')} className="px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-primary transition-colors shadow-lg hover:shadow-xl flex items-center mx-auto">
                Start Your Journey Now <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-primary py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Save time, save money!</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Sign up and we'll send the best deals to you. Receive exclusive hotel offers and travel updates directly to your inbox.</p>
            <form onSubmit={handleSubscribe}>
              <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
                <Input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="py-3.5"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubscribing}
                  className="py-3.5 whitespace-nowrap shadow-[0_8px_16px_-6px_rgba(41,98,255,0.4)]"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f172a] text-gray-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-primary" /> Stayzium
              </h3>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Your ultimate travel companion for booking hotels, resorts, and unique accommodations worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/></svg>
                </a>
                <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.95 4.57a10 10 0 01-2.82.77 4.96 4.96 0 002.16-2.72c-.95.55-2 .95-3.12 1.17a4.92 4.92 0 00-8.39 4.48A14 14 0 011.67 3.15 4.92 4.92 0 003.2 9.72a4.9 4.9 0 01-2.23-.62v.06a4.93 4.93 0 003.95 4.83 4.86 4.86 0 01-2.22.08 4.93 4.93 0 004.6 3.42 9.87 9.87 0 01-6.1 2.1 10 10 0 01-1.18-.07 13.94 13.94 0 007.55 2.21c9.06 0 14-7.5 14-14v-.64a10.08 10.08 0 002.46-2.53z"/></svg>
                </a>
                <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.85 3.92 2.31 7.15 2.16c1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-4.27.2-6.78 2.71-6.98 6.98C0 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.27 2.71 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.27-.2 6.78-2.71 6.98-6.98C23.99 15.67 24 15.26 24 12s-.01-3.67-.07-4.95c-.2-4.27-2.71-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1018.16 12 6.16 6.16 0 0012 5.84zm0 10.16A4 4 0 1116 12a4 4 0 01-4 4zm7.85-11.2a1.44 1.44 0 11-1.44-1.44 1.44 1.44 0 011.44 1.44z"/></svg>
                </a>
                <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.56v-5.56c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.66H9.33V9h3.42v1.56h.05c.48-.9 1.63-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.3zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM3.55 20.45h3.57V9H3.55v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white text-lg font-bold mb-6">Discover</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><Link to="/" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Home</Link></li>
                <li><Link to="/hotels" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Hotels</Link></li>
                <li><Link to="/destinations" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Destinations</Link></li>
                <li><Link to="/offers" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Offers</Link></li>
                <li><Link to="/user/bookings" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">My Bookings</Link></li>
                <li><Link to="/user/wishlist" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Wishlist</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><Link to="/contact" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Contact Us</Link></li>
                <li><Link to="/terms" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Terms & Conditions</Link></li>
                <li><Link to="/privacy" className="hover:text-white hover:ring-1 hover:ring-white/50 px-2 py-1 -ml-2 rounded transition-all">Privacy Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-gray-500 mt-0.5" />
                  <span>123 Travel Avenue, New York, NY 10001, United States</span>
                </li>
                <li className="flex items-center">
                  <Clock className="w-5 h-5 mr-3 text-gray-500" />
                  <span>Mon-Fri: 9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-gray-500" />
                  <span>hetmahida353@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 pb-4 flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-3 mb-6 md:mb-0">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#2962ff]" /> Terms of Service
              </Link>
              <div className="hidden md:block w-px h-4 bg-gray-700 mt-1"></div>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-medium">
                <Shield className="w-4 h-4 text-[#2962ff]" /> Privacy Policy
              </Link>
              <div className="hidden md:block w-px h-4 bg-gray-700 mt-1"></div>
              <span className="text-gray-400 flex items-center gap-2 font-medium">
                <CreditCard className="w-4 h-4 text-[#2962ff]" /> 100% Secure Payments
              </span>
            </div>
            <p className="text-gray-500 font-medium">&copy; {new Date().getFullYear()} Stayzium Booking. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <Toast 
        message={toastMessage} 
        type={toastType} 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
};

export default Home;
