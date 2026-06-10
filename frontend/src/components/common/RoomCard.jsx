import React from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const RoomCard = ({ room, hotelId, locationSearch, onImageClick, onSelect, buttonText = "Reserve Room", showButton = true }) => {
  const roomImgs = room.images && room.images.length > 0 ? room.images : (room.image ? [room.image] : ['/images/room.png']);
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
      <div className="w-full sm:w-64 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-gray-900 relative group">
        {/* Blurred background image */}
        <img 
          src={roomImgs[0]} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md scale-110 pointer-events-none" 
        />
        {/* Main image */}
        <img 
          src={roomImgs[0]} 
          alt={room.title}
          onClick={onImageClick ? () => onImageClick(roomImgs, 0) : undefined}
          className={`relative z-10 w-full h-full object-contain transition-transform ${onImageClick ? 'cursor-pointer group-hover:scale-105' : ''}`} 
          style={{ imageRendering: 'high-quality' }}
        />
        {roomImgs.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
            {roomImgs.length} Photos
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{room.title}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500 font-medium">
            <p className="flex items-center"><Users className="w-4 h-4 mr-1" /> Max: {room.maxPeople || 2}</p>
            {room.type && <p className="flex items-center">Type: {room.type}</p>}
            {room.bedType && <p className="flex items-center">Bed: {room.bedType}</p>}
            {room.roomSize && <p className="flex items-center">Size: {room.roomSize}</p>}
          </div>
          {room.facilities && room.facilities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {room.facilities.map(fac => (
                <Badge key={fac} variant="primary">{fac}</Badge>
              ))}
            </div>
          )}
          <p className="text-gray-600 mt-3 text-sm line-clamp-2">
            {room.desc}
          </p>
        </div>
        <div className="flex justify-between items-end mt-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">₹{Number(room.price).toFixed(2)}</span>
            <span className="text-sm text-gray-500 ml-1">/ night</span>
          </div>
          {showButton && hotelId && (
            onSelect ? (
              <Button variant="primary" onClick={() => onSelect(room)}>
                {buttonText}
              </Button>
            ) : (
              <Link 
                to={`/user/booking/${hotelId}${locationSearch ? locationSearch + '&' : '?'}roomId=${room._id}`}
              >
                <Button variant="primary">
                  {buttonText}
                </Button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
