import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Check, X, Building } from 'lucide-react';
import hotelService from '../../services/hotelService';
import roomService from '../../services/roomService';
import uploadService from '../../services/uploadService';
import toast from 'react-hot-toast';
import { showConfirm } from '../../utils/toastUtils';

const OwnerRooms = () => {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [newRoomImages, setNewRoomImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newRoom, setNewRoom] = useState({ 
    title: '', 
    hotelId: '', 
    price: '', 
    maxPeople: '',
    desc: '',
    type: 'Standard',
    bedType: 'Double',
    roomSize: '',
    facilities: [],
    status: 'Available',
    images: []
  });

  const availableFacilities = ['AC', 'Free WiFi', 'TV', 'Minibar', 'Balcony', 'Sea View', 'Bathtub', 'Pool Access'];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Owner's Hotels
      const hotelRes = await hotelService.getOwnerHotels();
      const ownerHotels = hotelRes.data.data || [];
      setHotels(ownerHotels);

      // 2. Fetch Rooms for each hotel
      let allRooms = [];
      for (const hotel of ownerHotels) {
        const roomRes = await roomService.getRoomsByHotel(hotel._id);
        if (roomRes.data.success) {
          // Attach hotel name for display
          const roomsWithHotelName = roomRes.data.data.map(room => ({
            ...room,
            hotelName: hotel.name
          }));
          allRooms = [...allRooms, ...roomsWithHotelName];
        }
      }
      setRooms(allRooms);
    } catch (error) {
      console.error('Error fetching rooms data:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setNewRoom({ 
      title: '', 
      hotelId: hotels.length > 0 ? hotels[0]._id : '', 
      price: '', 
      maxPeople: '', 
      desc: '',
      type: 'Standard',
      bedType: 'Double',
      roomSize: '',
      facilities: [],
      status: 'Available',
      images: []
    });
    setNewRoomImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setIsEditMode(true);
    setEditingRoomId(room._id);
    setNewRoom({
      title: room.title,
      hotelId: room.hotel,
      price: room.price,
      maxPeople: room.maxPeople,
      desc: room.desc || '',
      type: room.type || 'Standard',
      bedType: room.bedType || 'Double',
      roomSize: room.roomSize || '',
      facilities: room.facilities || [],
      status: room.status || 'Available',
      images: room.images || []
    });
    setNewRoomImages([]);
    setIsModalOpen(true);
  };

  const handleFacilityToggle = (facility) => {
    setNewRoom(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let uploadedImageUrls = [];
      
      if (newRoomImages && newRoomImages.length > 0) {
        // Multiple images upload
        const uploadPromises = Array.from(newRoomImages).map(async (img) => {
          const formData = new FormData();
          formData.append('image', img);
          const uploadRes = await uploadService.uploadImage(formData);
          if (uploadRes.data.success) {
            return uploadRes.data.data.url;
          }
          return null;
        });
        
        const results = await Promise.all(uploadPromises);
        uploadedImageUrls = results.filter(url => url !== null);
      }

      const payload = {
        title: newRoom.title,
        price: Number(newRoom.price),
        maxPeople: Number(newRoom.maxPeople),
        desc: newRoom.desc || 'Comfortable room with great amenities.',
        type: newRoom.type,
        bedType: newRoom.bedType,
        roomSize: newRoom.roomSize,
        facilities: newRoom.facilities,
        status: newRoom.status,
        images: [...(newRoom.images || [])]
      };

      if (uploadedImageUrls.length > 0) {
        payload.images = [...payload.images, ...uploadedImageUrls];
      }

      if (isEditMode) {
        await roomService.updateRoom(editingRoomId, payload);
      } else {
        await roomService.createRoom(newRoom.hotelId, payload);
      }
      
      setIsModalOpen(false);
      toast.success(isEditMode ? 'Room updated successfully' : 'Room created successfully');
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error(error.response?.data?.message || 'Error saving room');
    }
    setIsSaving(false);
  };

  const handleDelete = async (roomId) => {
    showConfirm('Are you sure you want to delete this room?', async () => {
      try {
        const res = await roomService.deleteRoom(roomId);
        if(res.data.success) {
          toast.success('Room deleted successfully');
          setRooms(prev => prev.filter(r => r._id !== roomId));
        }
      } catch (error) {
        console.error('Error deleting room:', error);
        toast.error('Error deleting room');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
          <p className="text-gray-600 mt-1">Configure pricing, capacity, and details for your rooms.</p>
        </div>
        <button 
          onClick={openAddModal}
          disabled={hotels.length === 0}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          title={hotels.length === 0 ? "You need to add a hotel first" : ""}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Room
        </button>
      </div>

      {hotels.length === 0 && !isLoading && (
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg flex items-center">
          <Building className="w-5 h-5 mr-2" />
          You need to create a Hotel/Property first before you can add rooms.
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No rooms found. Add your first room!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4 pl-6">Room Name</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price / Night</th>
                  <th className="p-4">Capacity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <p className="font-bold text-gray-900">{room.title}</p>
                      <p className="text-xs text-gray-500 font-mono">ID: {room._id.substring(room._id.length - 6)}</p>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{room.hotelName}</td>
                    <td className="p-4 text-gray-600">{room.type || 'Standard'}</td>
                    <td className="p-4 font-bold text-gray-900">₹{Number(room.price).toFixed(2)}</td>
                    <td className="p-4 text-gray-600">{room.maxPeople} Guests</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex w-fit items-center ${room.status === 'Available' || !room.status ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {(!room.status || room.status === 'Available') && <Check className="w-3 h-3 mr-1" />}
                        {room.status || 'Available'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(room)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(room._id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Room' : 'Add New Room'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room Title</label>
                  <input 
                    type="text" required
                    value={newRoom.title}
                    onChange={(e) => setNewRoom({...newRoom, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                    placeholder="e.g. Deluxe Suite" 
                  />
                </div>
                
                {!isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                    <select 
                      required
                      value={newRoom.hotelId}
                      onChange={(e) => setNewRoom({...newRoom, hotelId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white" 
                    >
                      {hotels.map(hotel => (
                        <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {isEditMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={newRoom.status}
                      onChange={(e) => setNewRoom({...newRoom, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white" 
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Room Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white" 
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bed Type</label>
                  <select 
                    value={newRoom.bedType}
                    onChange={(e) => setNewRoom({...newRoom, bedType: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white" 
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price / Night (₹)</label>
                  <input 
                    type="number" required min="0"
                    value={newRoom.price}
                    onChange={(e) => setNewRoom({...newRoom, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                    placeholder="15000" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Guests</label>
                  <input 
                    type="number" required min="1"
                    value={newRoom.maxPeople}
                    onChange={(e) => setNewRoom({...newRoom, maxPeople: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                    placeholder="2" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Size (e.g., '35 sqm')</label>
                <input 
                  type="text"
                  value={newRoom.roomSize}
                  onChange={(e) => setNewRoom({...newRoom, roomSize: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                  placeholder="35 sqm" 
                />
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableFacilities.map(fac => (
                    <label key={fac} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newRoom.facilities.includes(fac)}
                        onChange={() => handleFacilityToggle(fac)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{fac}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={newRoom.desc}
                  onChange={(e) => setNewRoom({...newRoom, desc: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                  placeholder="Describe the room features..." 
                />
              </div>

              {/* Multiple Images Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room & Facility Images</label>
                
                {/* Existing Images Preview & Delete */}
                {isEditMode && newRoom.images && newRoom.images.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    {newRoom.images.map((img, index) => (
                      <div key={index} className="relative group w-20 h-20">
                        <img 
                          src={img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000'}${img}`} 
                          alt={`Room ${index}`} 
                          className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" 
                          crossOrigin="anonymous" 
                        />
                        <button 
                          type="button"
                          onClick={() => setNewRoom(prev => ({...prev, images: prev.images.filter((_, i) => i !== index)}))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Newly Selected Images Preview & Delete */}
                {newRoomImages && newRoomImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-blue-600 mb-2">New Images to Upload:</p>
                    <div className="flex flex-wrap gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      {Array.from(newRoomImages).map((file, index) => (
                        <div key={`new-${index}`} className="relative group w-20 h-20">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt={`New Room ${index}`} 
                            className="w-full h-full object-cover rounded-lg border border-blue-200 shadow-sm" 
                          />
                          <button 
                            type="button"
                            onClick={() => setNewRoomImages(prev => Array.from(prev).filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm z-10"
                            title="Remove this new image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const filesArray = Array.from(e.target.files);
                    setNewRoomImages(prev => [...(prev || []), ...filesArray]);
                    e.target.value = null; // reset input so same file can be selected again if removed
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" 
                />
                <p className="text-xs text-gray-500 mt-1">Select multiple images to upload. You can remove them before saving.</p>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {isSaving ? 'Saving...' : (isEditMode ? 'Update Room' : 'Add Room')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRooms;
