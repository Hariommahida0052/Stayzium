const express = require('express');
const {
  getHotelReviews,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/hotel/:hotelId')
  .get(getHotelReviews)
  .post(protect, addReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
