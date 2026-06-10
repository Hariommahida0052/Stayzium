const express = require('express');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword,
  verify2FA
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-2fa', verify2FA);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

module.exports = router;
