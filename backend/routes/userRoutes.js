const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  getUserDashboardStats,
  getWishlist,
  toggleWishlist
} = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.put('/profile/password', protect, changePassword);

// Dashboard stats
router.get('/dashboard', protect, getUserDashboardStats);

// Wishlist
router.route('/wishlist')
  .get(protect, getWishlist);
  
router.post('/wishlist/:hotelId', protect, toggleWishlist);

// Admin Routes
const { 
  getUsers, 
  getUserById, 
  updateUserStatus, 
  toggleUserVerification,
  deleteUser 
} = require('../controllers/userController');
const { authorize } = require('../middlewares/authMiddleware');

router.route('/admin')
  .get(protect, authorize('admin'), getUsers);

router.route('/admin/:id')
  .get(protect, authorize('admin'), getUserById)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/admin/:id/status')
  .put(protect, authorize('admin'), updateUserStatus);

router.route('/admin/:id/verify')
  .put(protect, authorize('admin'), toggleUserVerification);

module.exports = router;
