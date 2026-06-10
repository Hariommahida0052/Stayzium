import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import BackToHome from '../../components/common/BackToHome';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await axios.put(`/auth/reset-password/${resetToken}`, { password });
      if (res.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              "Resetting my password was quick and easy. I got back to planning my trip in no time!"
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-4 sm:px-8 md:px-12 py-12 lg:py-16 bg-gray-50 lg:bg-gray-50/50 overflow-y-auto max-h-screen">
        <div className="max-w-md xl:max-w-lg w-full mx-auto my-auto bg-white p-6 sm:p-10 lg:p-12 rounded-3xl shadow-xl border border-gray-100">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Set New Password</h1>
            
            {isSuccess ? (
              <div className="text-center bg-green-50 rounded-xl p-8 border border-green-100">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset Successful</h3>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully reset. You will be redirected to the login page shortly.
                </p>
                <Link to="/login" className="inline-block px-8 py-3 bg-[#2962ff] text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                  Go to Login Now
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-8">
                  Please enter your new password below. Ensure it is at least 8 characters long.
                </p>

                {error && (
                  <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Input
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      rightIcon={showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      onRightIconClick={() => setShowPassword(!showPassword)}
                    />
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">Must be at least 8 characters.</p>
                  </div>

                  <div>
                    <Input
                      label="Confirm New Password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      rightIcon={showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  </div>

                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      fullWidth
                      className="py-3.5 text-base shadow-[0_8px_16px_-6px_rgba(41,98,255,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(41,98,255,0.6)]"
                    >
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
