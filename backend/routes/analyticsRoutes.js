const express = require('express');
const { getAdminSummary, getOwnerSummary, getChartData, getSystemHealth } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Admin analytics route
router.get('/admin-summary', protect, authorize('admin'), getAdminSummary);
router.get('/chart-data', protect, authorize('admin'), getChartData);
router.get('/system-health', protect, authorize('admin'), getSystemHealth);

// Owner analytics route
router.get('/owner-summary', protect, authorize('owner', 'admin'), getOwnerSummary);
router.get('/owner/export', protect, authorize('owner', 'admin'), require('../controllers/analyticsController').exportOwnerReport);

module.exports = router;
