import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import BackToHome from '../../components/common/BackToHome';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Mocked endpoint call, we'll create the backend route as well
      const res = await axios.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setIsSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-xl mr-4">
                MJ
              </div>
              <div>
                <h4 className="font-semibold text-white">Mike Johnson</h4>
                <p className="text-gray-400 text-sm">Customer</p>
              </div>
            </div>
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
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Forgot Password?</h1>
            
            {isSuccess ? (
              <div className="text-center bg-green-50 rounded-xl p-8 border border-green-100">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
                <p className="text-gray-600 mb-6">
                  We have sent password recovery instructions to <strong>{email}</strong>
                </p>
                <Link to="/login" className="text-[#2962ff] font-semibold hover:underline">
                  Back to login
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-8">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm font-medium border border-red-100">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />

                  <div className="pt-3">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      fullWidth
                      className="py-3.5 text-base shadow-[0_8px_16px_-6px_rgba(41,98,255,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(41,98,255,0.6)]"
                    >
                      {isSubmitting ? 'Sending Instructions...' : 'Send Instructions'}
                    </Button>
                  </div>
                </form>

                <div className="mt-8 text-center text-sm text-gray-600">
                  <Link to="/login" className="font-semibold text-[#2962ff] hover:underline">
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
