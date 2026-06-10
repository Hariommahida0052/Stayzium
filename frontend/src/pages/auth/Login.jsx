import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import BackToHome from '../../components/common/BackToHome';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, verify2FA } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (requires2FA) {
      // Handle OTP Verification
      const res = await verify2FA(userId, otp);
      if (res.success) {
        if (res.role === 'admin') navigate('/admin/dashboard');
        else if (res.role === 'owner') navigate('/owner/dashboard');
        else navigate('/user/dashboard');
      } else {
        setError(res.message);
      }
    } else {
      // Normal Login
      const res = await login(email, password);
      
      if (res.success) {
        if (res.requires2FA) {
          setRequires2FA(true);
          setUserId(res.userId);
        } else {
          if (res.role === 'admin') navigate('/admin/dashboard');
          else if (res.role === 'owner') navigate('/owner/dashboard');
          else navigate('/user/dashboard');
        }
      } else {
        setError(res.message);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      <BackToHome />
      {/* Left Panel - Visual/Testimonial */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gray-100 flex-col justify-end">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/customer_login_bg.png')" }}
        >
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent"></div>
        </div>
        
        {/* Testimonial Card */}
        <div className="relative z-10 p-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-800/80 backdrop-blur-md text-white p-8 rounded-2xl shadow-xl max-w-lg"
          >
            <div className="flex items-center mb-6 opacity-80">
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-bold tracking-tight">Stayzium</span>
            </div>
            <p className="text-lg font-medium leading-relaxed mb-6">
              "Stayzium completely transformed how I book my trips. The interface is clean, reliable, and cut my planning time in half."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl mr-4">
                SJ
              </div>
              <div>
                <h4 className="font-semibold text-white">Sarah Jenkins</h4>
                <p className="text-gray-400 text-sm">Frequent Customer</p>
              </div>
            </div>
          </motion.div>
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
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Stayzium</h1>
            <p className="text-gray-600 mb-6 text-sm">
              Welcome back. Please log in.
            </p>

            {error && (
              <div className="mb-5 bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {requires2FA ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2962ff] focus:bg-white transition-all text-center tracking-[0.5em] placeholder:tracking-normal placeholder:font-medium placeholder:text-base text-2xl font-bold"
                    required
                  />
                  <p className="mt-3 text-xs text-gray-500 text-center">
                    Check your email inbox for the code. It expires in 10 minutes.
                  </p>
                </div>
              ) : (
                <>
                  <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-[#2962ff] hover:text-blue-800 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      rightIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />
                  </div>
                </>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  fullWidth
                  className="py-3 text-base shadow-[0_8px_16px_-6px_rgba(41,98,255,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(41,98,255,0.6)]"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-[#2962ff] hover:underline">
                Sign up
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
