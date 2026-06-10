const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

module.exports = router;
