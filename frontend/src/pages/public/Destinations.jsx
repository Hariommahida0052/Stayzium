import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import hotelService from '../../services/hotelService';

const Destinations = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([
    { name: 'Saurashtra', image: '/images/gir.png', count: '1,245 properties' },
    { name: 'Kutch', image: '/images/kutch.png', count: '3,892 properties' },
    { name: 'Central Gujarat', image: '/images/heritage.png', count: '2,104 properties' },
    { name: 'South Gujarat', image: '/images/room.png', count: '840 properties' },
  ]);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const res = await hotelService.getDestinations();
        if (res.data.success && res.data.data.length > 0) {
          // Map dynamic data to regions, providing fallback images if needed
          const defaultImages = ['/images/gir.png', '/images/kutch.png', '/images/heritage.png', '/images/room.png'];
          const dynamicRegions = res.data.data.map((dest, idx) => ({
            name: dest.name,
            image: dest.image && dest.image !== '/images/room.png' ? dest.image : defaultImages[idx % defaultImages.length],
            count: dest.count
          }));
          setRegions(dynamicRegions);
        }
      } catch (error) {
        console.error('Failed to fetch destinations', error);
      }
    };
    fetchDestinations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      {/* Header */}
      <div className="bg-primary text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Explore Gujarat</h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Discover beautiful destinations around the globe and find the perfect place to stay for your next adventure.
          </p>
          
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-xl flex items-center shadow-lg">
            <Search className="w-6 h-6 text-gray-400 ml-3" />
            <input 
              type="text" 
              placeholder="Search for a city, region, or country..." 
              className="w-full py-3 px-4 text-gray-900 outline-none rounded-lg"
            />
            <button className="bg-primary hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Popular Regions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Popular Regions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regions.map((region, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate('/hotels')}
              className="relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl transition-all"
            >
              <img src={region.image} alt={region.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                <div>
                  <h3 className="text-white text-3xl font-bold mb-1">{region.name}</h3>
                  <p className="text-white/80 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> {region.count}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-primary transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Destinations;
