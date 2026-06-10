const express = require('express');
const router = express.Router();
const {
  getAllTickets,
  updateTicketStatus,
  addMessage
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protected Admin routes
router.use(protect);
router.use(authorize('admin'));

router.get('/admin', getAllTickets);
router.put('/admin/:id/status', updateTicketStatus);
router.post('/admin/:id/message', addMessage);

module.exports = router;
