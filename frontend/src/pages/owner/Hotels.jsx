import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import hotelService from '../../services/hotelService';
import uploadService from '../../services/uploadService';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';
import PropertyCard from '../../components/owner/PropertyCard';
import AddPropertyModal from '../../components/owner/AddPropertyModal';

const OwnerHotels = () => {
  const [properties, setProperties] = useState([]);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProperty, setNewProperty] = useState({ name: '', description: '', address: '', city: '', country: '', pricePerNight: '', amenities: '' });
  const [newPropertyImage, setNewPropertyImage] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHotelId, setEditingHotelId] = useState(null);

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingHotelId(null);
    setNewProperty({ name: '', description: '', address: '', city: '', country: '', pricePerNight: '', amenities: '' });
    setNewPropertyImage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (property) => {
    setIsEditMode(true);
    setEditingHotelId(property._id);
    setNewProperty({
      name: property.name,
      description: property.description || '',
      address: property.location?.address || '',
      city: property.location?.city || '',
      country: property.location?.country || '',
      pricePerNight: property.pricePerNight || '',
      amenities: property.amenities ? property.amenities.join(', ') : ''
    });
    setNewPropertyImage(null);
    setIsModalOpen(true);
  };

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const openImageModal = (id) => {
    setSelectedHotelId(id);
    setIsImageModalOpen(true);
    setImageFile(null);
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile || !selectedHotelId) return;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const uploadRes = await uploadService.uploadImage(formData);
      
      if (uploadRes.data.success) {
        const imageUrl = uploadRes.data.data.url;
        
        const hotel = properties.find(p => p._id === selectedHotelId);
        const updatedImages = [imageUrl, ...(hotel.images || [])];
        
        const updateRes = await hotelService.updateHotel(selectedHotelId, { images: updatedImages });
        
        if (updateRes.data.success) {
          setProperties(properties.map(p => p._id === selectedHotelId ? { ...p, images: updatedImages } : p));
          setIsImageModalOpen(false);
          toast.success('Image uploaded successfully');
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error uploading image');
    }
    setUploadingImage(false);
  };

  const fetchHotels = async () => {
    try {
      const res = await hotelService.getOwnerHotels();
      if (res.data.success) {
        setProperties(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleDelete = async (id) => {
    showConfirm('Are you sure you want to delete this property?', async () => {
      try {
        await hotelService.deleteHotel(id);
        setProperties(properties.filter(p => p._id !== id));
        toast.success('Property deleted successfully');
      } catch (error) {
        console.error('Error deleting hotel:', error);
        toast.error('Error deleting hotel');
      }
    });
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      let uploadedImageUrl = null;
      if (newPropertyImage) {
        const formData = new FormData();
        formData.append('image', newPropertyImage);
        const uploadRes = await uploadService.uploadImage(formData);
        if (uploadRes.data.success) {
          uploadedImageUrl = uploadRes.data.data.url;
        }
      }

      const payload = {
        name: newProperty.name,
        description: newProperty.description || 'A beautiful property to stay.',
        location: {
          address: newProperty.address || 'Central Address',
          city: newProperty.city,
          country: newProperty.country || 'India'
        },
        pricePerNight: Number(newProperty.pricePerNight),
        amenities: newProperty.amenities ? newProperty.amenities.split(',').map(a => a.trim()) : ['Free WiFi'],
      };

      if (uploadedImageUrl) {
        payload.images = [uploadedImageUrl];
      }

      if (isEditMode) {
        const res = await hotelService.updateHotel(editingHotelId, payload);
        if (res.data.success) {
          setProperties(properties.map(p => p._id === editingHotelId ? res.data.data : p));
          setIsModalOpen(false);
          toast.success('Property updated successfully');
        }
      } else {
        const res = await hotelService.createHotel(payload);
        if (res.data.success) {
          setProperties([res.data.data, ...properties]);
          setIsModalOpen(false);
          setNewProperty({ name: '', description: '', address: '', city: '', country: '', pricePerNight: '', amenities: '' });
          setNewPropertyImage(null);
          toast.success('Property created successfully');
        }
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
      toast.error('Error saving hotel: ' + (error.response?.data?.message || error.message));
    }
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-600 mt-1">Manage your hotel listings and properties.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Property
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard 
            key={property._id} 
            property={property} 
            handleDelete={handleDelete} 
            handleEdit={handleEdit}
            openImageModal={openImageModal} 
          />
        ))}
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newProperty={newProperty}
        setNewProperty={setNewProperty}
        setNewPropertyImage={setNewPropertyImage}
        handleAddProperty={handleAddProperty}
        isCreating={isCreating}
        isEditMode={isEditMode}
      />
      {/* Image Upload Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upload Property Photo</h2>
              <button onClick={() => setIsImageModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleImageUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Image File</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsImageModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" disabled={uploadingImage || !imageFile} className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerHotels;
