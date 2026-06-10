const express = require('express');
const router = express.Router();
const { subscribe, sendPromotionalNewsletter, getSubscribers, removeSubscriber } = require('../controllers/newsletterController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/subscribe', subscribe);
router.post('/send', protect, authorize('admin'), sendPromotionalNewsletter);
router.get('/subscribers', protect, authorize('admin'), getSubscribers);
router.delete('/subscribers/:id', protect, authorize('admin'), removeSubscriber);

module.exports = router;
