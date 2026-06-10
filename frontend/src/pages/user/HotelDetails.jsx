import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Users, Star, BedDouble, Heart, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import ImageSlider from '../../components/common/ImageSlider';
import hotelService from '../../services/hotelService';
import roomService from '../../services/roomService';
import userService from '../../services/userService';
import reviewService from '../../services/reviewService';
import { AuthContext } from '../../context/AuthContext';
import ImageLightbox from '../../components/common/ImageLightbox';
import RoomCard from '../../components/common/RoomCard';
import DateTimePicker from '../../components/common/DateTimePicker';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const HotelDetails = () => {
  const { id } = useParams();
  const locationUrl = useLocation();
  const queryParams = new URLSearchParams(locationUrl.search);
  const inDate = queryParams.get('in');
  const outDate = queryParams.get('out');
  
  const { user } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Review form state
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Selection state
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState(inDate ? new Date(inDate) : null);
  const [checkOut, setCheckOut] = useState(outDate ? new Date(outDate) : null);
  const navigate = useNavigate();

  // Calculate Duration and Price
  let durationHours = 0;
  let durationString = '';
  let totalPrice = 0;
  
  if (checkIn && checkOut && checkOut > checkIn) {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    durationHours = diffMs / (1000 * 60 * 60);
    const days = Math.floor(durationHours / 24);
    const hours = Math.floor(durationHours % 24);
    
    durationString = '';
    if (days > 0) durationString += `${days} Day${days > 1 ? 's' : ''} `;
    if (hours > 0) durationString += `${hours} Hour${hours > 1 ? 's' : ''}`;
    if (!durationString) durationString = 'Less than an hour';

    const basePrice = selectedRoom ? selectedRoom.price : (hotel?.pricePerNight || 0);
    totalPrice = (durationHours / 24) * basePrice;
  }

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const hotelRes = await hotelService.getHotelById(id);
        if (hotelRes.data.success) {
          setHotel(hotelRes.data.data);
        }
        
        const roomRes = await roomService.getRoomsByHotel(id);
        if (roomRes.data.success) {
          setRooms(roomRes.data.data);
        }

        fetchReviews();

        if (user) {
          const wishRes = await userService.getWishlist();
          if (wishRes.data.success) {
            const isSaved = wishRes.data.data.some(w => w._id === id);
            setIsWishlisted(isSaved);
          }
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [id, user]);

  const fetchReviews = async () => {
    try {
      const revRes = await reviewService.getHotelReviews(id);
      if (revRes.data.success) {
        setReviews(revRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error('Please login to submit a review');
    setIsSubmittingReview(true);
    try {
      await reviewService.addReview(id, reviewForm);
      setReviewForm({ rating: 5, comment: '' });
      fetchReviews();
      // Refetch hotel to get updated average rating
      const hotelRes = await hotelService.getHotelById(id);
      if (hotelRes.data.success) setHotel(hotelRes.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    showConfirm('Are you sure you want to delete your review?', async () => {
      try {
        await reviewService.deleteReview(reviewId);
        fetchReviews();
        const hotelRes = await hotelService.getHotelById(id);
        if (hotelRes.data.success) setHotel(hotelRes.data.data);
        toast.success('Review deleted successfully');
      } catch (err) {
        toast.error('Failed to delete review');
      }
    });
  };

  const openLightbox = (images, index) => {
    if (!images || images.length === 0) return;
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (!hotel) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Hotel not found.</div>;

  const galleryImages = hotel.images && hotel.images.length > 0 ? hotel.images : ['/images/heritage.png'];
  const displayImages = galleryImages.slice(0, 5); // display up to 5 in the grid

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />
      
      <ImageLightbox 
        isOpen={lightboxOpen} 
        images={lightboxImages} 
        currentIndex={lightboxIndex}
        title={hotel.name}
        onClose={() => setLightboxOpen(false)}
        onNext={() => setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)}
        onPrev={() => setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 mr-4">{hotel.name}</h1>
              {user && (
                <button 
                  onClick={async () => {
                    try {
                      await userService.toggleWishlist(hotel._id);
                      setIsWishlisted(!isWishlisted);
                    } catch(err) {
                      console.error('Error toggling wishlist', err);
                    }
                  }}
                  className={`p-2 rounded-full border transition-colors ${isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
            <p className="text-gray-600 flex items-center mt-2 text-lg">
              <MapPin className="w-5 h-5 mr-1 text-primary" /> {hotel.location?.city}, {hotel.location?.country}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right mr-3">
              <p className="font-bold text-gray-900">{hotel.rating >= 4.5 ? 'Exceptional' : 'Very Good'}</p>
              <p className="text-sm text-gray-500">{hotel.reviewsCount || 0} reviews</p>
            </div>
            <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
              {hotel.rating ? hotel.rating.toFixed(1) : '4.5'}
            </div>
          </div>
        </div>

        {/* 3D Image Slider Gallery */}
        <ImageSlider images={galleryImages} />

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {hotel.description || 'No description available for this property.'}
              </p>
            </div>

            {hotel.amenities && hotel.amenities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Popular Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {hotel.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center text-gray-700 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      <Star className="w-5 h-5 mr-2 text-primary fill-current" /> {amenity}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rooms Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
              {rooms.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center text-gray-500">
                  No rooms are currently available for this property.
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map(room => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      hotelId={hotel._id}
                      locationSearch={locationUrl.search}
                      onImageClick={openLightbox}
                      onSelect={(r) => setSelectedRoom(r)}
                      buttonText={selectedRoom?._id === room._id ? "Selected" : "Select Room"}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-primary" />
                Guest Reviews
              </h2>
              
              {user && (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star className={`w-8 h-8 ${reviewForm.rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                      <textarea
                        required
                        rows="3"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="What did you like or dislike?"
                        className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-70"
                    >
                      {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden mr-3 flex items-center justify-center">
                            {review.user?.profilePicture ? (
                              <img src={review.user.profilePicture} alt="User" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                                {review.user?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{review.user?.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded">
                            <Star className="w-4 h-4 fill-current mr-1" />
                            <span className="font-bold text-sm">{review.rating}</span>
                          </div>
                          {user && (user._id === review.user?._id || user.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete Review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar Booking Card */}
          <div className="w-full lg:w-[350px]">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <div className="flex flex-col mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-900">₹{Number(selectedRoom ? selectedRoom.price : hotel.pricePerNight).toFixed(2)}</span>
                  <span className="text-gray-500 ml-1 mb-1">/ 24 hrs {selectedRoom ? '' : 'avg'}</span>
                </div>
                {totalPrice > 0 && (
                  <div className="mt-4 bg-green-50 p-3 rounded-xl border border-green-100">
                    <p className="text-sm text-green-700 font-medium">Total Duration: {durationString}</p>
                    <p className="text-xl font-bold text-green-800 mt-1">Total: ₹{Number(totalPrice).toFixed(2)}</p>
                  </div>
                )}
              </div>
              
              {!selectedRoom && (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl mb-6 text-sm flex items-start">
                   <BedDouble className="w-5 h-5 mr-2 flex-shrink-0" />
                   <span>Select a room from the available options to start your booking.</span>
                </div>
              )}
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-gray-900 uppercase block mb-2">Check-in Date & Time</label>
                  <DateTimePicker 
                    selected={checkIn}
                    onChange={(date) => {
                      setCheckIn(date);
                      if (checkOut && date >= checkOut) {
                        setCheckOut(new Date(date.getTime() + 60 * 60 * 1000)); // Add 1 hour
                      }
                    }}
                    minDate={new Date()}
                    placeholderText="Select Check-in"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-900 uppercase block mb-2">Check-out Date & Time</label>
                  <DateTimePicker 
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    minDate={checkIn || new Date()}
                    placeholderText="Select Check-out"
                  />
                </div>
              </div>

              {selectedRoom ? (
                <button 
                  onClick={() => navigate(`/user/booking/${hotel._id}?roomId=${selectedRoom._id}&in=${checkIn.toISOString()}&out=${checkOut.toISOString()}`)}
                  disabled={!checkIn || !checkOut || checkIn >= checkOut}
                  className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center transition-all shadow-md ${!checkIn || !checkOut || checkIn >= checkOut ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}
                >
                  {(!checkIn || !checkOut) ? 'Select Dates' : (checkIn >= checkOut ? 'Invalid Dates' : 'Continue to Booking')}
                </button>
              ) : (
                <button className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl flex items-center justify-center cursor-not-allowed">
                  Select a Room First
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
