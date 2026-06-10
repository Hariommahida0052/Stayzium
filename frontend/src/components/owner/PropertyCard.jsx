import React from 'react';
import { Edit2, Trash2, MapPin, Star, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property, handleDelete, handleEdit, openImageModal }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {/* Main image */}
        <img 
          src={property.images && property.images.length > 0 ? property.images[0] : '/images/room.png'} 
          alt={property.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            property.status === 'approved' ? 'bg-green-100 text-green-700' :
            property.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 shadow-sm">
          <button 
            onClick={() => handleEdit(property)}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleDelete(property._id)}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" 
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{property.name}</h2>
          <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current mr-1" />
            <span className="text-sm font-bold text-gray-700">{property.rating > 0 ? property.rating : 'New'}</span>
          </div>
        </div>
        
        <p className="text-gray-500 flex items-center text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {property.location?.city}, {property.location?.country}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 font-medium">TOTAL ROOMS</p>
            <p className="font-semibold text-gray-900">{property.rooms}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Link to="/owner/rooms" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Manage Rooms
            </Link>
            <button onClick={() => openImageModal(property._id)} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline flex items-center">
              <ImageIcon className="w-4 h-4 mr-1" /> Update Photos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
