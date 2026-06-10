import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import hotelService from '../../services/hotelService';
import roomService from '../../services/roomService';
import bookingService from '../../services/bookingService';
import settingsService from '../../services/settingsService';
import { AuthContext } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import DateTimePicker from '../../components/common/DateTimePicker';

const BookingPage = () => {
  const { id } = useParams(); // hotel id
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const locationUrl = useLocation();
  const queryParams = new URLSearchParams(locationUrl.search);
  const targetRoomId = queryParams.get('roomId');
  const inDateStr = queryParams.get('in');
  const outDateStr = queryParams.get('out');
  const adults = queryParams.get('adults') || 2;
  const children = queryParams.get('children') || 0;

  const [checkInDateObj, setCheckInDateObj] = useState(inDateStr ? new Date(inDateStr) : new Date());
  const [checkOutDateObj, setCheckOutDateObj] = useState(outDateStr ? new Date(outDateStr) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
  const [durationHours, setDurationHours] = useState(24);
  const [durationString, setDurationString] = useState('1 Day');
  
  useEffect(() => {
    if (checkInDateObj && checkOutDateObj && checkOutDateObj > checkInDateObj) {
      const diffMs = checkOutDateObj.getTime() - checkInDateObj.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      setDurationHours(hours);
      
      const d = Math.floor(hours / 24);
      const h = Math.floor(hours % 24);
      let str = '';
      if (d > 0) str += `${d} Day${d > 1 ? 's' : ''} `;
      if (h > 0) str += `${h} Hour${h > 1 ? 's' : ''}`;
      if (!str) str = 'Less than an hour';
      setDurationString(str);
    } else {
      setDurationHours(0);
      setDurationString('Invalid Date Range');
    }
  }, [checkInDateObj, checkOutDateObj]);

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [publicSettings, setPublicSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.contactNumber || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Hotel details
        const hotelRes = await hotelService.getHotelById(id);
        if (hotelRes.data.success) {
          setHotel(hotelRes.data.data);
        }

        // Fetch rooms for this hotel
        const roomRes = await roomService.getRoomsByHotel(id);
        if (roomRes.data.success && roomRes.data.data.length > 0) {
          if (targetRoomId) {
            const selectedRoom = roomRes.data.data.find(r => r._id === targetRoomId);
            setRoom(selectedRoom || roomRes.data.data[0]);
          } else {
            setRoom(roomRes.data.data[0]);
          }
        }
        
        // Fetch public settings for cancellation policy
        try {
          const settingsRes = await settingsService.getPublicSettings();
          if (settingsRes.data.success) {
            setPublicSettings(settingsRes.data.data);
          }
        } catch (settingsErr) {
          console.error("Failed to load public settings", settingsErr);
        }
      } catch (error) {
        console.error('Error fetching booking data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [id, targetRoomId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!room) {
      toast.error('No rooms available for this property to book!');
      return;
    }

    setIsSubmitting(true);
    try {
      const basePrice = (durationHours / 24) * room.price;
      const totalAmount = basePrice + (basePrice * 0.18);

      // 1. Load Razorpay script
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsSubmitting(false);
        return;
      }

      // 2. Create Order on our backend
      const { data: orderData } = await axios.post('/payments/create-order', { amount: totalAmount });
      if (!orderData.success) {
        toast.error('Could not create payment order');
        setIsSubmitting(false);
        return;
      }

      // 3. Open Razorpay UI
      const options = {
        key: orderData.key_id, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Stayzium',
        description: `Booking for ${hotel?.name}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          toast.loading('Verifying payment and confirming booking...', { id: 'payment-verify' });
          try {
            // 4. Verify payment on backend
            const verifyRes = await axios.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              // 5. Create Booking
              const payload = {
                hotel: id,
                room: room._id,
                checkInDate: checkInDateObj,
                checkOutDate: checkOutDateObj,
                totalAmount,
                guests: Number(adults) + Number(children),
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id
              };

              const bookingRes = await bookingService.createBooking(payload);
              toast.dismiss('payment-verify');
              if (bookingRes.data.success) {
                toast.success('Payment successful! Booking confirmed.');
                navigate(`/user/booking-success/${bookingRes.data.data._id}`);
              }
            }
          } catch (err) {
            console.error('Payment verification failed', err);
            toast.dismiss('payment-verify');
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#2563eb'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
      });
      paymentObject.open();

    } catch (error) {
      console.error('Booking/Payment failed:', error);
      toast.error(error.response?.data?.message || 'Payment initiation failed');
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 pt-24 text-center">Loading booking details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-[#2563eb] font-medium hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to property
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Secure your booking</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Form */}
          <div className="flex-1 space-y-8">
            {!room && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg font-medium">
                Sorry, no rooms are currently available for this property. You cannot complete this booking.
              </div>
            )}
            
            <form onSubmit={handleBooking} className="space-y-8">
              {/* Personal Details */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Your Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  <Input label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <div className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                    <ShieldCheck className="w-4 h-4 mr-1" /> Secure
                  </div>
                </div>
                
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl text-center mb-6">
                  <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-6 mx-auto mb-4" />
                  <p className="text-gray-600">You will be redirected to Razorpay's secure checkout to complete your payment.</p>
                </div>

                {publicSettings?.cancellationPolicy && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-left">
                    <h3 className="text-sm font-bold text-blue-900 mb-1">Cancellation Policy</h3>
                    <p className="text-sm text-blue-800">{publicSettings.cancellationPolicy}</p>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={!room || isSubmitting}
                fullWidth
                className="py-4 text-base shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_20px_-8px_rgba(37,99,235,0.6)]"
              >
                {isSubmitting ? 'Opening secure checkout...' : 'Confirm & Pay'}
              </Button>
            </form>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h2>
              
              <div className="flex gap-4 mb-6">
                <img src={hotel?.images?.[0] || '/images/room.png'} alt="Property" className="w-24 h-24 object-cover rounded-lg" />
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">{hotel?.name || 'Property'}</h3>
                  <p className="text-sm text-gray-500 mt-1">{hotel?.location?.city || 'Location'}</p>
                  <p className="text-sm font-medium text-[#2962ff] mt-1">{room ? room.title : 'No Room Selected'}</p>
                </div>
              </div>

              <div className="space-y-4 py-6 border-t border-b border-gray-100">
                <div className="flex flex-col text-sm relative">
                  <span className="text-gray-600 flex items-center mb-2"><CalendarIcon className="w-4 h-4 mr-1"/> Check-in Date & Time</span>
                  <DateTimePicker
                    selected={checkInDateObj}
                    onChange={(date) => { setCheckInDateObj(date); if (date > checkOutDateObj) setCheckOutDateObj(new Date(date.getTime() + 60 * 60 * 1000)); }}
                    minDate={new Date()}
                  />
                </div>
                <div className="flex flex-col text-sm relative mt-3">
                  <span className="text-gray-600 flex items-center mb-2"><CalendarIcon className="w-4 h-4 mr-1"/> Check-out Date & Time</span>
                  <DateTimePicker
                    selected={checkOutDateObj}
                    onChange={(date) => setCheckOutDateObj(date)}
                    minDate={checkInDateObj}
                  />
                </div>
                <div className="flex justify-between text-sm mt-4">
                  <span className="text-gray-600">Guests</span>
                  <span className="font-medium text-gray-900">{adults} Adults{Number(children) > 0 ? `, ${children} Children` : ''}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{durationString}</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium text-gray-900">₹{room ? Number((durationHours / 24) * room.price).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & Fees (18%)</span>
                  <span className="font-medium text-gray-900">₹{room ? Number(((durationHours / 24) * room.price) * 0.18).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-100">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#2962ff]">₹{room ? Number(((durationHours / 24) * room.price) * 1.18).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
