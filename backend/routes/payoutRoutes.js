const express = require('express');
const router = express.Router();
const { 
  getAdminPendingPayouts,
  markAsPaid,
  getOwnerWalletSummary
} = require('../controllers/payoutController');

const { protect, authorize } = require('../middlewares/authMiddleware');

router.get('/admin/pending', protect, authorize('admin'), getAdminPendingPayouts);
router.post('/admin/pay/:ownerId', protect, authorize('admin'), markAsPaid);

router.get('/owner/summary', protect, authorize('owner'), getOwnerWalletSummary);

module.exports = router;
