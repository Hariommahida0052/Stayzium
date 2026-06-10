import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import ImageLightbox from './ImageLightbox';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const ImageSlider = ({ images = [] }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-100 flex items-center justify-center rounded-2xl">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="w-full mb-10 h-[50vh] md:h-[500px] rounded-2xl overflow-hidden shadow-lg relative group bg-gray-900">
        <Swiper
          grabCursor={true}
          loop={true}
          slidesPerView={1}
          pagination={{ 
            clickable: true,
            dynamicBullets: true 
          }}
          navigation={{
            enabled: true,
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          modules={[Pagination, Navigation, Autoplay]}
          className="w-full h-full"
        >
          {images.map((img, index) => (
            <SwiperSlide key={index} className="w-full h-full flex items-center justify-center bg-black">
              <img 
                src={img} 
                alt={`Slide ${index + 1}`} 
                onClick={() => openLightbox(index)}
                className="w-full h-full object-cover md:object-contain cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                loading="lazy"
                style={{ imageRendering: 'high-quality' }}
              />
            </SwiperSlide>
          ))}
          {/* Custom Navigation Buttons for cleaner look */}
          <div className="swiper-button-prev !text-white !opacity-0 group-hover:!opacity-100 transition-opacity duration-300 drop-shadow-md"></div>
          <div className="swiper-button-next !text-white !opacity-0 group-hover:!opacity-100 transition-opacity duration-300 drop-shadow-md"></div>
        </Swiper>
      </div>

      <ImageLightbox 
        isOpen={lightboxOpen}
        images={images}
        currentIndex={currentIndex}
        onClose={() => setLightboxOpen(false)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </>
  );
};

export default ImageSlider;
