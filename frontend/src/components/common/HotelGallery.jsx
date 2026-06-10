import React from 'react';
import { ImageIcon } from 'lucide-react';

const HotelGallery = ({ images = [], onImageClick }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 md:h-[500px] bg-gray-100 flex items-center justify-center rounded-2xl mb-10">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  // Display logic: up to 5 images.
  const displayImages = images.slice(0, 5);
  const remainingCount = images.length - 5;

  return (
    <div className="w-full mb-10 h-[50vh] md:h-[500px] rounded-2xl overflow-hidden flex gap-2">
      {/* Left side: Large main image */}
      <div 
        className={`relative ${displayImages.length > 1 ? 'w-full md:w-1/2' : 'w-full'} h-full group cursor-pointer overflow-hidden`}
        onClick={() => onImageClick(0)}
      >
        <img 
          src={displayImages[0]} 
          alt="Hotel Main" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ imageRendering: 'high-quality' }}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>

      {/* Right side: Grid of up to 4 smaller images (Desktop only or scrollable) */}
      {displayImages.length > 1 && (
        <div className="hidden md:grid w-1/2 h-full grid-cols-2 grid-rows-2 gap-2">
          {displayImages.slice(1, 5).map((img, idx) => {
            const isLast = idx === 3; // 4th image in the slice (which is index 3)
            const globalIndex = idx + 1;

            return (
              <div 
                key={globalIndex} 
                className="relative w-full h-full group cursor-pointer overflow-hidden"
                onClick={() => onImageClick(globalIndex)}
              >
                <img 
                  src={img} 
                  alt={`Hotel image ${globalIndex + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ imageRendering: 'high-quality' }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                
                {isLast && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white transition-colors duration-300 group-hover:bg-black/60">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-80" />
                    <span className="text-xl font-bold">+{remainingCount}</span>
                    <span className="text-sm font-medium mt-1">Show all photos</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Show all button for mobile (if multiple images) */}
      {displayImages.length > 1 && (
        <div className="md:hidden absolute bottom-4 right-4 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onImageClick(0); }}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-bold rounded-lg shadow-lg flex items-center"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            1 / {images.length}
          </button>
        </div>
      )}
    </div>
  );
};

export default HotelGallery;
