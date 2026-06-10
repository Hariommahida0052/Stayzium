import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageLightbox = ({ isOpen, images, currentIndex, onClose, onNext, onPrev, title = "Photos" }) => {
  const thumbnailContainerRef = useRef(null);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && onNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (isOpen && thumbnailContainerRef.current) {
      const activeThumbnail = thumbnailContainerRef.current.children[currentIndex];
      if (activeThumbnail) {
        activeThumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] flex flex-col bg-[#111111]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 z-[101]">
          <div className="text-white/80 font-semibold text-lg flex items-center">
            {title}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center shadow-lg"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden p-4">
          
          {/* Prev Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black border border-white/20 text-white transition-all z-[101]"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main Image */}
          <div className="relative w-full max-w-6xl h-[65vh] md:h-[75vh] flex items-center justify-center select-none">
            <motion.img
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              className="w-full h-full object-contain rounded-xl drop-shadow-2xl"
              style={{ imageRendering: 'high-quality' }}
            />
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black border border-white/20 text-white transition-all z-[101]"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Thumbnails Footer */}
        {images.length > 1 && (
          <div className="w-full bg-[#111111] py-4 px-4 border-t border-white/10">
            <div className="max-w-6xl mx-auto flex flex-col">
              <div className="text-white/70 text-sm font-medium mb-3">
                All Photos ({images.length})
              </div>
              <div 
                ref={thumbnailContainerRef}
                className="flex items-center gap-3 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx > currentIndex) {
                        for(let i=0; i < (idx - currentIndex); i++) onNext();
                      } else if (idx < currentIndex) {
                        for(let i=0; i < (currentIndex - idx); i++) onPrev();
                      }
                    }}
                    className={`relative w-20 h-16 md:w-24 md:h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                      idx === currentIndex ? 'ring-2 ring-white opacity-100' : 'opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageLightbox;
