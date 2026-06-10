import React from 'react';
import { MapPin, Star } from 'lucide-react';
import Button from '../ui/Button';

const HotelCard = ({ hotel, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group"
    >
      <div className="w-full md:w-80 h-64 md:h-auto flex-shrink-0 overflow-hidden bg-gray-100 relative min-h-[240px]">
        <img 
          src={hotel.images && hotel.images.length > 0 ? hotel.images[0] : '/images/room.png'} 
          alt={hotel.name} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{hotel.name}</h3>
              <p className="text-gray-500 flex items-center text-sm mt-1">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" /> 
                {hotel.location?.city}, {hotel.location?.country}
              </p>
            </div>
            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg h-fit">
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
              <span className="font-bold text-yellow-700">
                {hotel.rating || '4.8'}
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-3 line-clamp-2">{hotel.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {hotel.amenities?.slice(0, 4).map(amenity => (
              <span key={amenity} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                {amenity}
              </span>
            ))}
            {hotel.amenities?.length > 4 && (
              <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-end mt-6">
          <div>
            <p className="text-sm text-gray-500">{hotel.reviewsCount || '120'} reviews</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#2962ff]">₹{Number(hotel.pricePerNight).toFixed(2)}</p>
            <p className="text-sm text-gray-500 mb-2">per night</p>
            <Button variant="primary">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
