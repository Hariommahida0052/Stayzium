const express = require('express');
const router = express.Router();
const {
  getAllReports,
  updateReportStatus
} = require('../controllers/reportController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protected Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin', getAllReports);
router.put('/admin/:id/status', updateReportStatus);

module.exports = router;
