import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Loader2 } from 'lucide-react';
import offerService from '../../services/offerService';
import uploadService from '../../services/uploadService';
import hotelService from '../../services/hotelService';
import toast from 'react-hot-toast';

const AdminOfferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [hotels, setHotels] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    discount: '',
    description: '',
    validUntil: '',
    color: 'bg-blue-500',
    isActive: true,
    image: '',
    participatingHotels: []
  });

  const colors = [
    { label: 'Blue', value: 'bg-blue-500' },
    { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Purple', value: 'bg-purple-500' },
    { label: 'Green', value: 'bg-green-500' },
    { label: 'Red', value: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchHotels();
    if (isEdit) {
      fetchOffer();
    }
  }, [id]);

  const fetchHotels = async () => {
    try {
      const res = await hotelService.getAllHotels(); 
      if (res.data.success) {
        setHotels(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const fetchOffer = async () => {
    try {
      const res = await offerService.getOfferById(id);
      if (res.data.success) {
        const offer = res.data.data;
        setFormData({
          title: offer.title,
          discount: offer.discount,
          description: offer.description,
          validUntil: new Date(offer.validUntil).toISOString().split('T')[0],
          color: offer.color,
          isActive: offer.isActive,
          image: offer.image,
          participatingHotels: offer.participatingHotels.map(h => h._id)
        });
      }
    } catch (error) {
      console.error('Error fetching offer:', error);
      toast.error('Failed to load offer data');
      navigate('/admin/offers');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadService.uploadImage(fd);
      if (res.data.success) {
        setFormData({ ...formData, image: res.data.data.url });
      }
    } catch (error) {
      console.error('Error uploading image', error);
      toast.error('Failed to upload image');
    } finally {
      setSaving(false);
    }
  };

  const handleHotelSelection = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setFormData({ ...formData, participatingHotels: selected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (isEdit) {
        await offerService.updateOffer(id, formData);
        toast.success('Offer updated successfully!');
      } else {
        await offerService.createOffer(formData);
        toast.success('Offer created successfully!');
      }
      navigate('/admin/offers');
    } catch (error) {
      console.error('Error saving offer:', error);
      toast.error(error.response?.data?.message || 'Failed to save offer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admin/offers" className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Offer' : 'Create New Offer'}</h1>
          <p className="text-gray-600 mt-1">Configure offer details and select participating hotels.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Early Bird Summer Special"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Text</label>
                <input 
                  type="text" 
                  required
                  value={formData.discount}
                  onChange={(e) => setFormData({...formData, discount: e.target.value})}
                  placeholder="e.g. 20% OFF or Free Safari"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                <input 
                  type="date" 
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Tag Color</label>
                <select 
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                >
                  {colors.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">Offer is Active</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the offer..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                  {formData.image ? (
                    <div className="relative inline-block">
                      <img src={formData.image} alt="Offer Preview" className="h-32 rounded-lg object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, image: ''})}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full text-xs shadow-md"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary font-medium hover:underline text-sm"
                      >
                        Click to upload an image
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participating Hotels (Hold Ctrl/Cmd to select multiple)
                </label>
                <select 
                  multiple
                  value={formData.participatingHotels}
                  onChange={handleHotelSelection}
                  className="h-32"
                >
                  {hotels.map(hotel => (
                    <option key={hotel._id} value={hotel._id}>
                      {hotel.name} - {hotel.location?.city}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Leave unselected if it applies generally (you can implement logic later).</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link 
              to="/admin/offers" 
              className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isEdit ? 'Update Offer' : 'Save Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminOfferForm;
