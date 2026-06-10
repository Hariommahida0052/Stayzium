const express = require('express');
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/public')
  .get(getPublicSettings);

router.route('/')
  .get(protect, authorize('admin'), getSettings)
  .put(protect, authorize('admin'), updateSettings);

module.exports = router;
