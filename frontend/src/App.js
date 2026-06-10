import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import OwnerLayout from './components/layout/OwnerLayout';

// Public/Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Home from './pages/public/Home';
import Destinations from './pages/public/Destinations';
import Offers from './pages/public/Offers';
import Contact from './pages/public/Contact';

// Footer Pages
import About from './pages/public/About';
import Careers from './pages/public/Careers';
import Press from './pages/public/Press';
import Blog from './pages/public/Blog';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import Countries from './pages/public/Countries';
import Regions from './pages/public/Regions';
import Cities from './pages/public/Cities';
import Districts from './pages/public/Districts';
import Airports from './pages/public/Airports';

// User Pages
import HotelListing from './pages/user/HotelListing';
import HotelDetails from './pages/user/HotelDetails';
import BookingPage from './pages/user/BookingPage';
import BookingSuccess from './pages/user/BookingSuccess';
import UserDashboard from './pages/user/Dashboard';
import MyBookings from './pages/user/MyBookings';
import Wishlist from './pages/user/Wishlist';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';

// Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerHotels from './pages/owner/Hotels';
import OwnerRooms from './pages/owner/Rooms';
import OwnerBookings from './pages/owner/Bookings';
import OwnerWallet from './pages/owner/Wallet';
import OwnerProfile from './pages/owner/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminHotels from './pages/admin/Hotels';
import AdminBookings from './pages/admin/Bookings';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';
import AdminOffers from './pages/admin/Offers';
import AdminOfferForm from './pages/admin/OfferForm';
import AdminTickets from './pages/admin/Tickets';
import AdminReports from './pages/admin/Reports';
import AdminPayouts from './pages/admin/Payouts';
import AdminNewsletter from './pages/admin/Newsletter';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<HotelListing />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/hotels/:id" element={<HotelDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="/maintenance" element={<Maintenance />} />
        
        {/* Footer Routes */}
        <Route path="/about" element={<About />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/press" element={<Press />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/countries" element={<Countries />} />
        <Route path="/regions" element={<Regions />} />
        <Route path="/cities" element={<Cities />} />
        <Route path="/districts" element={<Districts />} />
        <Route path="/airports" element={<Airports />} />
        
        {/* User Protected Routes */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="booking/:id" element={<BookingPage />} />
          <Route path="booking-success/:id" element={<BookingSuccess />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Owner Protected Routes */}
        <Route path="/owner" element={<OwnerLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="hotels" element={<OwnerHotels />} />
          <Route path="rooms" element={<OwnerRooms />} />
          <Route path="bookings" element={<OwnerBookings />} />
          <Route path="wallet" element={<OwnerWallet />} />
          <Route path="profile" element={<OwnerProfile />} />
        </Route>

        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="hotels" element={<AdminHotels />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="offers/new" element={<AdminOfferForm />} />
          <Route path="offers/edit/:id" element={<AdminOfferForm />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>
      </Router>
      </SocketProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            fontFamily: 'inherit',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
