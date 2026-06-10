const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const mongoose = require('mongoose');

// Utility to get all dates between checkIn and checkOut
const getDatesInRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const date = new Date(start.getTime());
  const dates = [];

  while (date <= end) {
    dates.push(new Date(date).getTime());
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Traveler)
exports.createBooking = async (req, res, next) => {
  try {
    const { hotel, room, checkInDate, checkOutDate, guests, razorpayOrderId, razorpayPaymentId } = req.body;

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return res.status(400).json({ success: false, message: 'Check-out time must be after check-in time' });
    }

    // Calculate exact duration and prorated price
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const durationHours = diffMs / (1000 * 60 * 60);
    const baseAmount = (durationHours / 24) * roomDoc.price;
    const totalAmount = baseAmount + (baseAmount * 0.18);

    const requestedDates = getDatesInRange(checkInDate, checkOutDate);

    // 1. Check if any requested date is already in unavailableDates
    // Assuming we use the first room number or global if roomNumbers is empty
    let unavailableDates = [];
    if (roomDoc.roomNumbers && roomDoc.roomNumbers.length > 0) {
      unavailableDates = roomDoc.roomNumbers[0].unavailableDates.map(d => new Date(d).getTime());
    }

    const isOverlap = requestedDates.some(date => unavailableDates.includes(date));
    if (isOverlap) {
      return res.status(400).json({ success: false, message: 'Room is not available for the selected dates' });
    }

    // 2. Create the booking
    const booking = await Booking.create({
      user: req.user.id,
      hotel,
      room,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalAmount,
      guests,
      razorpayOrderId,
      razorpayPaymentId
    });

    // 3. Update room unavailability dates
    if (!roomDoc.roomNumbers || roomDoc.roomNumbers.length === 0) {
      roomDoc.roomNumbers = [{ number: 101, unavailableDates: requestedDates.map(d => new Date(d)) }];
    } else {
      const datesAsObjects = requestedDates.map(d => new Date(d));
      roomDoc.roomNumbers[0].unavailableDates.push(...datesAsObjects);
    }
    await roomDoc.save();
    // 4. Send Email Notification
    const hotelDoc = await Hotel.findById(hotel);
    if (req.user && req.user.preferences && req.user.preferences.emailNotifications !== false) {
      const sendEmail = require('../utils/sendEmail');
      const { getBookingConfirmationTemplate } = require('../utils/emailTemplates');
      await sendEmail({
        email: req.user.email,
        subject: 'Booking Confirmation',
        html: getBookingConfirmationTemplate(booking._id, hotelDoc?.name || 'our hotel', checkInDate, checkOutDate)
      });
    }

    // 5. Notify the hotel owner
    if (hotelDoc && hotelDoc.owner) {
      const { sendNotification } = require('../utils/notificationService');
      await sendNotification({
        userId: hotelDoc.owner,
        role: 'owner',
        title: 'New Booking Received!',
        message: `You have received a new booking for ${hotelDoc.name}.`,
        type: 'booking',
        link: '/owner/bookings'
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel')
      .populate('room')
      .populate('user', 'name email contactNumber');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure the user requesting is the one who made the booking, or an admin/owner
    // Simplified for now: just return it if found.
    // In production, add authorization check here.
    
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel')
      .populate('room')
      .populate('user', 'name email contactNumber');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('hotel', 'name images location')
      .populate('room', 'title');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's hotel bookings
// @route   GET /api/bookings/owner-bookings
// @access  Private (Owner/Admin)
exports.getOwnerBookings = async (req, res, next) => {
  try {
    // 1. Find all hotels owned by this user
    const hotels = await Hotel.find({ owner: req.user.id });
    const hotelIds = hotels.map(h => h._id);

    // 2. Find all bookings for those hotels
    const bookings = await Booking.find({ hotel: { $in: hotelIds } })
      .populate('hotel', 'name')
      .populate('room', 'title')
      .populate('user', 'name email');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin
// @access  Private (Admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status && status !== 'All Statuses') query.status = status.toLowerCase();
    
    // For search, we might need to populate first or search by booking ID
    // It's easier to search by booking ID or use aggregation, but for simplicity we'll just search ID
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
         query._id = search;
      }
    }

    const bookings = await Booking.find(query)
      .populate('hotel', 'name location')
      .populate('user', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update refund status (Admin)
// @route   PUT /api/bookings/admin/:id/refund
// @access  Private (Admin)
exports.updateRefundStatus = async (req, res, next) => {
  try {
    const { refundStatus, refundAmount } = req.body;
    
    if (!['none', 'pending', 'approved', 'rejected', 'refunded'].includes(refundStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid refund status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.refundStatus = refundStatus;
    if (refundAmount !== undefined) {
      booking.refundAmount = refundAmount;
    }

    await booking.save();

    // Send email to admin if a booking is cancelled/disputed
    const PlatformSetting = require('../models/PlatformSetting');
    const sendEmail = require('../utils/sendEmail');
    const settings = await PlatformSetting.findOne();
    if (settings && settings.bookingDisputeEmail && settings.supportEmail) {
      try {
        await sendEmail({
          email: settings.supportEmail,
          subject: `Booking Cancelled/Disputed - ${booking._id}`,
          html: `
            <h3>Booking Cancellation Notice</h3>
            <p>A booking has been cancelled on Stayzium.</p>
            <ul>
              <li><strong>Booking ID:</strong> ${booking._id}</li>
              <li><strong>User:</strong> ${req.user.name} (${req.user.email})</li>
            </ul>
            <p>Please review this in the Admin Dashboard if necessary.</p>
          `
        });
      } catch (err) {
        console.error('Failed to send booking cancellation email:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
       return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Remove dates from Room's unavailableDates
    const roomDoc = await Room.findById(booking.room);
    if (roomDoc && roomDoc.roomNumbers && roomDoc.roomNumbers.length > 0) {
      const datesToFree = getDatesInRange(booking.checkInDate, booking.checkOutDate).map(d => new Date(d).getTime());
      roomDoc.roomNumbers[0].unavailableDates = roomDoc.roomNumbers[0].unavailableDates.filter(d => {
        return !datesToFree.includes(new Date(d).getTime());
      });
      await roomDoc.save();
    }

    // Send Email Notification
    if (req.user && req.user.preferences && req.user.preferences.emailNotifications !== false) {
      const hotelDoc = await Hotel.findById(booking.hotel);
      const sendEmail = require('../utils/sendEmail');
      const { getBookingCancellationTemplate } = require('../utils/emailTemplates');
      await sendEmail({
        email: req.user.email,
        subject: 'Booking Cancellation',
        html: getBookingCancellationTemplate(booking._id, hotelDoc?.name || 'our hotel')
      });
    }

    res.status(200).json({ success: true, message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Booking Status (Approve/Decline)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner/Admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['confirmed', 'cancelled', 'completed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Optional: verify that the logged-in owner actually owns the hotel for this booking
    if (req.user.role === 'owner') {
      const hotel = await Hotel.findById(booking.hotel);
      if (hotel.owner.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
      }
    }

    booking.status = status;
    await booking.save();

    // If cancelled by owner, remove blocked dates from room
    if (status === 'cancelled') {
      const roomDoc = await require('../models/Room').findById(booking.room);
      if (roomDoc && roomDoc.roomNumbers && roomDoc.roomNumbers.length > 0) {
        const { getDatesInRange } = require('../utils/dateUtils');
        const datesToFree = getDatesInRange(booking.checkInDate, booking.checkOutDate).map(d => new Date(d).getTime());
        roomDoc.roomNumbers[0].unavailableDates = roomDoc.roomNumbers[0].unavailableDates.filter(d => {
          return !datesToFree.includes(new Date(d).getTime());
        });
        await roomDoc.save();
      }
    }

    // Send Real-Time Notification to user
    const { sendNotification } = require('../utils/notificationService');
    const hotelDoc = await Hotel.findById(booking.hotel);
    
    await sendNotification({
      userId: booking.user,
      title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your booking at ${hotelDoc?.name || 'the hotel'} has been ${status}.`,
      type: 'booking',
      link: '/bookings'
    });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};
