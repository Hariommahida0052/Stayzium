import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, MapPin, DollarSign, List, Image as ImageIcon, Building, CheckCircle2, Trash2, Plus } from 'lucide-react';

const AddPropertyModal = ({ 
  isOpen, 
  onClose, 
  newProperty, 
  setNewProperty, 
  setNewPropertyImage, 
  handleAddProperty, 
  isCreating,
  isEditMode
}) => {
  const [amenityInput, setAmenityInput] = useState('');
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Sync initial amenities if any (for edit mode in future)
  useEffect(() => {
    if (newProperty.amenities && typeof newProperty.amenities === 'string') {
      const parsed = newProperty.amenities.split(',').map(a => a.trim()).filter(a => a);
      if (parsed.length > 0 && amenitiesList.length === 0) {
        setAmenitiesList(parsed);
      }
    }
  }, [isOpen]);

  // Clean up preview URL
  useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
      setAmenitiesList([]);
      setAmenityInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddAmenity = (e) => {
    e.preventDefault();
    if (amenityInput.trim() && !amenitiesList.includes(amenityInput.trim())) {
      const updatedList = [...amenitiesList, amenityInput.trim()];
      setAmenitiesList(updatedList);
      setNewProperty({ ...newProperty, amenities: updatedList.join(', ') });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    const updatedList = amenitiesList.filter(a => a !== amenityToRemove);
    setAmenitiesList(updatedList);
    setNewProperty({ ...newProperty, amenities: updatedList.join(', ') });
  };

  const handleAmenityKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleAddAmenity(e);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setNewPropertyImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setNewPropertyImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Property' : 'Add New Property'}</h2>
            <p className="text-sm text-gray-500 mt-1">{isEditMode ? 'Update the details of your property.' : 'Fill in the details to list your property.'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form id="add-property-form" onSubmit={handleAddProperty} className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-2">
                <Building className="w-5 h-5 mr-2 text-blue-500" /> Basic Information
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Property Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="text" required
                      value={newProperty.name}
                      onChange={(e) => setNewProperty({...newProperty, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      placeholder="e.g. Grand Horizon Resort" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" required
                        value={newProperty.city}
                        onChange={(e) => setNewProperty({...newProperty, city: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                        placeholder="e.g. Mumbai" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                    <input 
                      type="text" required
                      value={newProperty.country}
                      onChange={(e) => setNewProperty({...newProperty, country: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      placeholder="e.g. India" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price Per Night (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                      type="number" required min="1"
                      value={newProperty.pricePerNight}
                      onChange={(e) => setNewProperty({...newProperty, pricePerNight: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium" 
                      placeholder="e.g. 5000" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Amenities & Images */}
            <div className="space-y-6">
              
              {/* Amenities Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-2">
                  <List className="w-5 h-5 mr-2 text-blue-500" /> Amenities & Features
                </h3>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Add Amenities</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyDown={handleAmenityKeyDown}
                      className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" 
                      placeholder="e.g. Free WiFi, Pool" 
                    />
                    <button 
                      type="button"
                      onClick={handleAddAmenity}
                      className="px-4 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </button>
                  </div>
                  
                  {/* Chips Container */}
                  <div className="flex flex-wrap gap-2 mt-3 min-h-[40px] p-2 bg-gray-50/50 rounded-lg border border-gray-100 border-dashed">
                    {amenitiesList.length === 0 ? (
                      <span className="text-sm text-gray-400 p-1">No amenities added yet.</span>
                    ) : (
                      amenitiesList.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium animate-in fade-in zoom-in duration-200">
                          {amenity}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveAmenity(amenity)}
                            className="text-blue-400 hover:text-blue-800 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center border-b pb-2">
                  <ImageIcon className="w-5 h-5 mr-2 text-blue-500" /> Property Image
                </h3>
                
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                  className={`relative w-full h-48 rounded-2xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center
                    ${previewUrl ? 'border-transparent bg-gray-900' : 
                      isDragging ? 'border-blue-500 bg-blue-50 cursor-copy' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer'}
                  `}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden" 
                  />
                  
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-sm font-medium rounded-lg transition-colors border border-white/20 shadow-sm"
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <span className="px-2.5 py-1 bg-green-500 text-white text-xs font-bold rounded-md flex items-center shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Selected
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 pointer-events-none">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-blue-500">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">Click or drag image to upload</p>
                      <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-3 rounded-b-3xl mt-auto">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="add-property-form"
            disabled={isCreating} 
            className="px-8 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-md shadow-blue-500/20 flex items-center"
          >
            {isCreating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditMode ? 'Updating Property...' : 'Saving Property...'}
              </>
            ) : (
              isEditMode ? 'Update Property' : 'Save Property'
            )}
          </button>
        </div>
      </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddPropertyModal;
