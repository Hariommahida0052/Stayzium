const express = require('express');
const {
  addRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// mergeParams: true allows us to access parameters from other routers
// e.g., accessing :hotelId from the hotel router
const router = express.Router({ mergeParams: true });

router.route('/')
  .get(getRooms)
  .post(protect, authorize('owner', 'admin'), addRoom);

router.route('/:id')
  .get(getRoom)
  .put(protect, authorize('owner', 'admin'), updateRoom)
  .delete(protect, authorize('owner', 'admin'), deleteRoom);

module.exports = router;
