import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const res = await userService.getWishlist();
      if (res.data.success) {
        setWishlistItems(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async (hotelId) => {
    try {
      const res = await userService.toggleWishlist(hotelId);
      if (res.data.success) {
        // Optimistically update the list
        setWishlistItems(prev => prev.filter(item => item._id !== hotelId));
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-1">Properties you have saved for later.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your wishlist...</div>
      ) : wishlistItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link to="/hotels" className="text-[#2962ff] font-medium hover:underline">Explore properties to save</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="relative h-56 overflow-hidden">
                <img src={item.images?.[0] || '/images/kutch.png'} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button 
                  onClick={() => handleToggleWishlist(item._id)}
                  className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md text-red-500 hover:scale-110 transition-transform"
                >
                  <Heart className="w-5 h-5 fill-current" />
                </button>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-gray-900">{item.rating || 0}</span>
                </div>
              </div>
              <div className="p-5">
                <div className="text-sm text-gray-500 mb-2 flex items-center line-clamp-1">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" /> {item.location?.city}, {item.location?.state}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{item.reviewsCount || 0} reviews</p>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                  <div>
                     <p className="text-xs text-gray-500">Starts from</p>
                     <p className="text-xl font-bold text-primary">₹{Number(item.pricePerNight).toFixed(2)}<span className="text-sm text-gray-500 font-normal"> / night</span></p>
                  </div>
                  <Link to={`/hotels/${item._id}`} className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
