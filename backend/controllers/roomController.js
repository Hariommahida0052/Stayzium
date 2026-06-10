const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// @desc    Add a room
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private (Owner/Admin)
exports.addRoom = async (req, res, next) => {
  try {
    const hotelId = req.params.hotelId;
    
    // Check if hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    
    // Ensure the user owns the hotel or is admin
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add rooms to this hotel' });
    }

    const roomData = { ...req.body, hotel: hotelId };
    const room = await Room.create(roomData);

    // Send Bulk Email to all users if the hotel is approved
    if (hotel.status === 'approved') {
      const { sendBulkPromotionalEmail } = require('../utils/bulkEmailService');
      const { getNewRoomTemplate } = require('../utils/emailTemplates');
      sendBulkPromotionalEmail(
        `New Rooms at ${hotel.name}`,
        getNewRoomTemplate(hotel.name, room.type)
      );
    }

    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ hotel: req.params.hotelId });
    res.status(200).json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Owner/Admin)
exports.updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this room' });
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Owner/Admin)
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this room' });
    }

    // Delete images from Cloudinary
    if (room.images && room.images.length > 0) {
      const { deleteFromCloudinary, getPublicIdFromUrl } = require('../utils/cloudinary');
      for (const imageUrl of room.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId).catch(err => console.error('Failed to delete image from Cloudinary:', err));
        }
      }
    }

    await room.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
