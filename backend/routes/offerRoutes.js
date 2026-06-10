const express = require('express');
const router = express.Router();
const {
  getPublicOffers,
  getAllOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  toggleOfferStatus
} = require('../controllers/offerController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getPublicOffers);
router.get('/:id', getOfferById);

// Protected Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin/all', getAllOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);
router.put('/:id/toggle', toggleOfferStatus);

module.exports = router;
