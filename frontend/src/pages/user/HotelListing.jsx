import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Search, Star, Filter, ChevronDown } from 'lucide-react';
import hotelService from '../../services/hotelService';
import Navbar from '../../components/common/Navbar';
import HotelCard from '../../components/common/HotelCard';

const HotelListing = () => {
  const navigate = useNavigate();
  const locationUrl = useLocation();
  const queryParams = new URLSearchParams(locationUrl.search);
  const initialSearch = queryParams.get('search') || '';
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const queryParts = [];
        if (searchTerm) queryParts.push(`search=${encodeURIComponent(searchTerm)}`);
        if (maxPrice < 100000) queryParts.push(`maxPrice=${maxPrice}`);
        if (selectedStars.length > 0) queryParts.push(`rating=${selectedStars.join(',')}`);
        if (selectedTypes.length > 0) queryParts.push(`propertyType=${selectedTypes.join(',')}`);
        if (selectedFacilities.length > 0) queryParts.push(`amenities=${selectedFacilities.join(',')}`);
        if (sortBy) queryParts.push(`sort=${sortBy}`);

        const queryString = queryParts.join('&');
        
        const res = await hotelService.getAllHotels(queryString);
        if (res.data.success) {
          setHotels(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };

    // Debounce the fetch slightly to avoid too many requests while typing/sliding
    const timeoutId = setTimeout(() => {
      fetchHotels();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, maxPrice, selectedStars, selectedTypes, selectedFacilities, sortBy]);

  const handleStarToggle = (star) => {
    setSelectedStars(prev => 
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleFacilityToggle = (facility) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) ? prev.filter(f => f !== facility) : [...prev, facility]
    );
  };

  const filteredHotels = hotels; // We are now doing server-side filtering

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Search Header */}
      <div className="bg-primary pb-8 pt-4 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white p-2 rounded-xl shadow-lg flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative flex items-center bg-gray-50 rounded-lg">
              <MapPin className="absolute left-4 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Destination or Hotel Name" 
                className="w-full bg-transparent py-3 pl-12 pr-4 text-gray-900 outline-none" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-primary hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center justify-center">
              <Search className="w-5 h-5 mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center mb-4">
              <Filter className="w-5 h-5 mr-2" /> Filters
            </h3>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Max Price: ₹{Number(maxPrice).toFixed(2)}</h4>
                <input 
                  type="range" 
                  min="0" 
                  max="100000" 
                  step="1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary" 
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>₹0</span>
                  <span>₹100,000+</span>
                </div>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Star Rating</h4>
                {[5, 4, 3].map(star => (
                  <label key={star} className="flex items-center space-x-3 mb-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-primary focus:ring-primary" 
                      checked={selectedStars.includes(star)}
                      onChange={() => handleStarToggle(star)}
                    />
                    <span className="flex items-center text-gray-700">
                      {star} <Star className="w-4 h-4 ml-1 text-yellow-500 fill-current" />
                    </span>
                  </label>
                ))}
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Property Type</h4>
                {['Hotel', 'Resort', 'Tent'].map(type => (
                  <label key={type} className="flex items-center space-x-3 mb-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-primary focus:ring-primary" 
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeToggle(type)}
                    />
                    <span className="text-gray-700">{type}</span>
                  </label>
                ))}
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Facilities</h4>
                {['Pool', 'Spa', 'Free WiFi', 'Restaurant', 'Desert Safari', 'Jungle Safari', 'Sea View'].map(fac => (
                  <label key={fac} className="flex items-center space-x-3 mb-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded text-primary focus:ring-primary" 
                      checked={selectedFacilities.includes(fac)}
                      onChange={() => handleFacilityToggle(fac)}
                    />
                    <span className="text-gray-700">{fac}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{filteredHotels.length} properties found</h2>
            <div className="flex items-center">
              <span className="text-gray-500 mr-2">Sort by:</span>
              <select 
                className="font-medium text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:text-primary"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="-createdAt">Recommended</option>
                <option value="pricePerNight">Price: Low to High</option>
                <option value="-pricePerNight">Price: High to Low</option>
                <option value="-rating">Rating: High to Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-6">
            {filteredHotels.length > 0 ? filteredHotels.map((hotel) => (
              <HotelCard 
                key={hotel._id}
                hotel={hotel}
                onClick={() => navigate(`/hotels/${hotel._id}${locationUrl.search}`)}
              />
            )) : (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 text-lg">No properties found matching your criteria.</p>
                <button onClick={() => {setSearchTerm(''); setMaxPrice(100000); setSelectedStars([5,4,3]); setSelectedTypes(['Hotel', 'Resort', 'Tent']); setSelectedFacilities([]);}} className="mt-4 text-primary font-bold hover:underline">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelListing;
