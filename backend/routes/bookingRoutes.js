const express = require('express');
const {
  createBooking,
  getBookingById,
  getMyBookings,
  getOwnerBookings,
  getAllBookings,
  cancelBooking
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Traveler routes
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
// Owner routes
router.get('/owner-bookings', protect, authorize('owner', 'admin'), getOwnerBookings);
router.put('/:id/status', protect, authorize('owner', 'admin'), require('../controllers/bookingController').updateBookingStatus);

// Admin routes
const { updateRefundStatus } = require('../controllers/bookingController');
router.get('/admin', protect, authorize('admin'), getAllBookings);
router.put('/admin/:id/refund', protect, authorize('admin'), updateRefundStatus);

// Traveler routes (ID routes should be at the bottom)
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
