const express = require('express');
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getOwnerHotels,
  getAdminAllHotels,
  updateHotelStatus,
  toggleFeaturedHotel
} = require('../controllers/hotelController');

const { protect, authorize } = require('../middlewares/authMiddleware');

// Include other resource routers
const roomRouter = require('./roomRoutes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:hotelId/rooms', roomRouter);

// Custom middlewares to check if user is logged in (but don't fail if not, for public routes)
const checkUser = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      const User = require('../models/User');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // do nothing, let it be unauthenticated
    }
  }
  next();
};

// Owner specific routes
router.get('/owner/my-hotels', protect, authorize('owner', 'admin'), getOwnerHotels);
router.post('/owner/sync-calendar', protect, authorize('owner', 'admin'), require('../controllers/hotelController').syncCalendar);

// Admin specific routes
router.get('/admin/all', protect, authorize('admin'), getAdminAllHotels);
router.put('/admin/:id/status', protect, authorize('admin'), updateHotelStatus);
router.put('/admin/:id/featured', protect, authorize('admin'), toggleFeaturedHotel);

// Public and Protected common routes
router.get('/public/destinations', require('../controllers/hotelController').getDestinations);

router.route('/')
  .get(getHotels)
  .post(protect, authorize('owner', 'admin'), createHotel);

router.route('/:id')
  .get(checkUser, getHotelById)
  .put(protect, authorize('owner', 'admin'), updateHotel)
  .delete(protect, authorize('owner', 'admin'), deleteHotel);

module.exports = router;
