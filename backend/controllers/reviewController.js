const Review = require('../models/Review');
const Hotel = require('../models/Hotel');

// @desc    Get reviews for a hotel
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
exports.getHotelReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ hotel: req.params.hotelId })
      .populate('user', 'name profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/reviews/hotel/:hotelId
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    req.body.hotel = req.params.hotelId;
    req.body.user = req.user.id;

    const hotel = await Hotel.findById(req.params.hotelId);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this hotel' });
    }
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update review' });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    // trigger average calculation manually since findByIdAndUpdate doesn't trigger save
    await review.constructor.getAverageRating(review.hotel);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete review' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
