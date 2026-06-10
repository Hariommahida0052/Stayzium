import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, MapPin, Download, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import bookingService from '../../services/bookingService';

const BookingSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const receiptRef = useRef(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(id);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch booking', err);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBooking();
    } else {
      setLoading(false);
      setError('Invalid booking ID.');
    }
  }, [id]);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher resolution
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Receipt_Stayzium_${id.slice(-6).toUpperCase()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
      toast.error('Failed to generate receipt. Please try again.');
    }
    setIsDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 text-center">
        <p className="text-gray-600">Loading booking confirmation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm border border-red-100">
          <p className="text-red-500 font-medium mb-4">{error || 'Booking not found.'}</p>
          <Link to="/user/dashboard" className="text-primary hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const { hotel, room, user, checkInDate, checkOutDate, totalAmount, guests, _id } = booking;
  const bookingIdStr = `#TRP-${_id.slice(-6).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden text-center"
        >
          <div className="bg-primary p-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-20 h-20 text-white mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-primary-100 text-white/90">Your reservation has been successfully completed.</p>
            <div className="mt-6 bg-white/20 px-4 py-2 rounded-lg inline-block">
              <span className="text-white/80 text-sm">Booking ID: </span>
              <span className="text-white font-mono font-bold tracking-wider">{bookingIdStr}</span>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-left">Reservation Details</h2>
            
            <div className="flex flex-col sm:flex-row text-left gap-6 border border-gray-100 rounded-2xl p-6 mb-8 bg-gray-50">
              <img src={hotel?.images?.[0] || "/images/heritage.png"} alt="Hotel" className="w-full sm:w-32 h-32 object-cover rounded-xl" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{hotel?.name}</h3>
                <p className="text-gray-500 flex items-center text-sm mt-1 mb-4">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {hotel?.location?.city || 'Location not available'}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Check-in</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Check-out</p>
                    <p className="font-medium text-gray-900 text-sm">
                       {new Date(checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-8">
              We've sent a confirmation email to <strong>{user?.email}</strong> with all the details.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={handleDownloadReceipt}
                disabled={isDownloading}
                className={`w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl flex items-center justify-center transition-colors ${isDownloading ? 'bg-gray-100 cursor-wait' : 'hover:bg-gray-50'}`}
              >
                {isDownloading ? (
                   <span className="flex items-center"><div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div> Generating PDF...</span>
                ) : (
                  <><Download className="w-5 h-5 mr-2" /> Download Receipt</>
                )}
              </button>
              <Link to="/user/dashboard" className="w-full sm:w-auto px-6 py-3 bg-primary text-white font-medium rounded-xl hover:bg-blue-700 flex items-center justify-center transition-colors">
                Go to Dashboard <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Hidden PDF Receipt Template */}
      <div className="absolute top-[-10000px] left-[-10000px] pointer-events-none">
        <div ref={receiptRef} className="w-[800px] bg-white p-10 text-gray-900 font-sans border border-gray-200">
          <div className="flex justify-between items-start mb-8 border-b pb-8">
            <div>
               <h1 className="text-3xl font-bold text-primary flex items-center">
                 <FileText className="w-8 h-8 mr-2" />
                 Stayzium
               </h1>
               <p className="text-gray-500 mt-2 text-sm">Your reliable travel partner</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-400 mb-2">Receipt</h2>
              <p className="font-mono font-bold">{bookingIdStr}</p>
              <p className="text-sm text-gray-500 mt-1">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-8">
             <div>
               <h3 className="text-xs uppercase text-gray-400 font-bold mb-3 tracking-wider">Customer Details</h3>
               <p className="font-bold text-lg">{user?.name}</p>
               <p className="text-gray-600">{user?.email}</p>
               <p className="text-gray-600">{user?.contactNumber || 'N/A'}</p>
             </div>
             <div>
               <h3 className="text-xs uppercase text-gray-400 font-bold mb-3 tracking-wider">Property Details</h3>
               <p className="font-bold text-lg">{hotel?.name}</p>
               <p className="text-gray-600">{hotel?.location?.address}</p>
               <p className="text-gray-600">{hotel?.location?.city}, {hotel?.location?.country}</p>
             </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 grid grid-cols-3 gap-6">
             <div>
                <p className="text-xs uppercase text-gray-500 font-bold mb-1">Check-in</p>
                <p className="font-medium">{new Date(checkInDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
             </div>
             <div>
                <p className="text-xs uppercase text-gray-500 font-bold mb-1">Check-out</p>
                <p className="font-medium">{new Date(checkOutDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
             </div>
             <div>
                <p className="text-xs uppercase text-gray-500 font-bold mb-1">Guests</p>
                <p className="font-medium">{guests} Person(s)</p>
             </div>
          </div>

          <div className="mb-8 border-b border-gray-200 pb-8">
            <h3 className="text-xs uppercase text-gray-400 font-bold mb-4 tracking-wider">Booking Breakdown</h3>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
               <div>
                 <p className="font-bold">{room?.title || 'Selected Room'}</p>
                 <p className="text-sm text-gray-500">Base Fare</p>
               </div>
               <p className="font-bold">₹{(totalAmount / 1.18).toFixed(2)}</p>
            </div>
            <div className="flex justify-between items-center py-3">
               <div>
                 <p className="font-medium text-gray-600">Taxes & Fees (18% GST)</p>
               </div>
               <p className="font-medium text-gray-600">₹{(totalAmount - (totalAmount / 1.18)).toFixed(2)}</p>
            </div>
          </div>

          <div className="flex justify-end">
             <div className="w-1/2">
                <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl">
                   <p className="font-bold text-lg uppercase">Total Amount</p>
                   <p className="font-bold text-2xl text-primary">₹{Number(totalAmount).toFixed(2)}</p>
                </div>
             </div>
          </div>
          
          <div className="mt-16 text-center text-gray-400 text-sm">
            <p>Thank you for booking with Stayzium. Have a wonderful stay!</p>
            <p className="mt-1">For support, contact hetmahida353@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
