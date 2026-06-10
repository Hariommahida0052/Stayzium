import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Building2, CheckCircle2, Shield, CreditCard } from 'lucide-react';
import BackToHome from '../../components/common/BackToHome';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Signup = () => {
  const [role, setRole] = useState('user'); // 'user' or 'owner'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '', // For owner
    agreeTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    
    // For owners, we append business name to the name if they provided it
    const fullName = role === 'owner' && formData.businessName 
      ? formData.businessName 
      : `${formData.firstName} ${formData.lastName}`.trim();

    const userData = {
      name: fullName,
      email: formData.email,
      password: formData.password,
      role
    };

    const res = await register(userData);
    
    if (res.success) {
      if (res.role === 'owner') navigate('/owner/dashboard');
      else navigate('/user/dashboard');
    } else {
      setError(res.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      <BackToHome />
      {/* Left Panel - Visual/Testimonial */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gray-100 flex-col justify-end transition-all duration-500">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${role === 'owner' ? '/images/hero_bg.png' : '/images/customer_signup_bg.png'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
        </div>
        
        {/* Testimonial Card */}
        <div className="relative z-10 p-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/80 backdrop-blur-md text-white p-8 rounded-2xl shadow-xl max-w-lg"
            >
              <div className="flex items-center mb-6 opacity-80">
                <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xl font-bold tracking-tight">Stayzium {role === 'owner' && 'Partner'}</span>
              </div>
              <p className="text-lg font-medium leading-relaxed mb-6">
                {role === 'user' 
                  ? '"Stayzium completely transformed how I book my trips. The interface is clean, reliable, and cut my planning time in half."'
                  : '"Joining Stayzium was the best business decision. Our bookings increased by 40% in the first month alone!"'}
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl mr-4">
                  {role === 'user' ? 'SJ' : 'DP'}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{role === 'user' ? 'Sarah Jenkins' : 'David Patel'}</h4>
                  <p className="text-gray-400 text-sm">{role === 'user' ? 'Frequent Customer' : 'Hotel Owner'}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center overflow-y-auto h-screen bg-gray-50 lg:bg-gray-50/50 py-8 px-4 sm:px-8 md:px-12">
        <div className="w-full max-w-md xl:max-w-lg bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 my-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-600 mb-6 text-sm">
              {role === 'user' ? 'Start your journey with Stayzium and unlock exclusive travel deals.' : 'Join our network to list your properties and reach millions of customers.'}
            </p>

            {/* Role Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${
                  role === 'user' ? 'bg-white text-[#2962ff] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Customer
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`flex-1 flex items-center justify-center py-2 text-sm font-semibold rounded-lg transition-all ${
                  role === 'owner' ? 'bg-white text-[#2962ff] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Hotel Owner
              </button>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              
              <AnimatePresence mode="popLayout">
                {role === 'owner' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      label="Business Name"
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="e.g. Doe Properties LLC"
                      required={role === 'owner'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="e.g. Jane"
                  required={role === 'user'} 
                />
                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="e.g. Doe"
                  required={role === 'user'}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="jane.doe@example.com"
                required
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  rightIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  onRightIconClick={() => setShowPassword(!showPassword)}
                />
              </div>

              <div className="flex items-start pt-1">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#2962ff] focus:ring-[#2962ff]"
                />
                <label htmlFor="agreeTerms" className="ml-2 text-xs text-gray-600 leading-relaxed">
                  I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-[#2962ff] hover:underline">Terms</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#2962ff] hover:underline">Privacy Policy</Link>.
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  className="py-3 text-base shadow-[0_8px_16px_-6px_rgba(41,98,255,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(41,98,255,0.6)]"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#2962ff] hover:underline">
                Log in here
              </Link>
            </div>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
