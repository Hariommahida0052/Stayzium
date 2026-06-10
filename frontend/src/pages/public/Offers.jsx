import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { Tag, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import offerService from '../../services/offerService';

const Offers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await offerService.getPublicOffers();
      if (res.data.success) {
        setOffers(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />
      
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-4">
            <Tag className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Exclusive Offers</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our latest deals, promotions, and exclusive packages to make your next trip even more memorable and affordable.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <Tag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Offers</h3>
            <p className="text-gray-500">Check back later for exciting new deals and promotions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {offers.map((offer) => (
              <div key={offer._id} className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-shadow flex flex-col ${isExpired(offer.validUntil) ? 'border-red-200 opacity-70' : 'border-gray-100 hover:shadow-lg'}`}>
                <div className="relative h-48 bg-gray-100">
                  {offer.image ? (
                    <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className={`absolute top-4 right-4 text-white font-bold px-3 py-1 rounded-lg shadow-sm ${offer.color || 'bg-blue-500'}`}>
                    {offer.discount}
                  </div>
                  {isExpired(offer.validUntil) && (
                    <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center">
                      <span className="text-white font-bold text-xl bg-red-600/90 px-4 py-2 rounded-lg transform -rotate-12 border-2 border-white">EXPIRED</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h3>
                  <p className="text-gray-600 mb-6 flex-1">{offer.description}</p>
                  
                  <div className={`flex items-center text-sm mb-6 font-medium ${isExpired(offer.validUntil) ? 'text-red-500' : 'text-gray-500'}`}>
                    <Clock className="w-4 h-4 mr-2" />
                    Valid until {new Date(offer.validUntil).toLocaleDateString()}
                  </div>
                  
                  <button 
                    disabled={isExpired(offer.validUntil)}
                    onClick={() => {
                      // Navigate to hotels with specific offer filter in state if needed
                      // For now, we'll navigate to /hotels
                      navigate('/hotels');
                    }}
                    className="w-full py-3 px-4 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
                  >
                    View Participating Hotels
                    {!isExpired(offer.validUntil) && <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Offers;
