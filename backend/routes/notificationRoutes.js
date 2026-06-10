const express = require('express');
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  clearNotifications 
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getNotifications);

router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/clear', clearNotifications);

module.exports = router;
