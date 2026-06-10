import React, { useState } from 'react';
import Navbar from '../../components/common/Navbar';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import axios from 'axios';
import Toast from '../../components/ui/Toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post('/contact', formData);
      if (res.data.success) {
        setToastType('success');
        setToastMessage(res.data.message);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          subject: 'General Inquiry',
          message: ''
        });
      }
    } catch (error) {
      console.error(error);
      setToastType('error');
      setToastMessage(error.response?.data?.message || 'Failed to send message. Please try again.');
    }
    setIsLoading(false);
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have questions about your booking or need help planning your next trip? Our customer support team is here to help 24/7.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Information */}
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-lg text-primary">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">Call Us</p>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am to 6pm IST</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-lg text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">Email Us</p>
                    <p className="text-gray-600">hetmahida353@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">We'll reply within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary/10 p-3 rounded-lg text-primary">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-1">Office</p>
                    <p className="text-gray-600">Stayzium India HQ<br />SG Highway, Ahmedabad<br />Gujarat, India 380015</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none" placeholder="john.doe@example.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select name="subject" value={formData.subject} onChange={handleChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white">
                  <option>General Inquiry</option>
                  <option>Booking Modification</option>
                  <option>Cancellation</option>
                  <option>Payment Issue</option>
                  <option>Feedback</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} required rows="5" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none" placeholder="How can we help you?"></textarea>
              </div>
              
              <button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50">
                <Send className="w-5 h-5 mr-2" />
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default Contact;
