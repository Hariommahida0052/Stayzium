const Ticket = require('../models/Ticket');

// @desc    Get all tickets
// @route   GET /api/tickets/admin
// @access  Private/Admin
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    let query = {};
    
    if (status && status !== 'All Statuses') {
      // Make case-insensitive regex for the enum
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }
    
    // For search we can search by subject or issue type
    if (search) {
      query.subject = { $regex: search, $options: 'i' };
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .populate('replies.admin', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Ticket.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: tickets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Ticket fetch error:', error);
    next(error);
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/admin/:id/status
// @access  Private/Admin
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { status, priority } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    
    await ticket.save();
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a message to a ticket
// @route   POST /api/tickets/admin/:id/message
// @access  Private/Admin
exports.addMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email').populate('replies.admin', 'name');
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.replies.push({
      admin: req.user._id,
      message,
      createdAt: new Date()
    });

    ticket.status = 'In Progress';
    await ticket.save();

    const populatedTicket = await Ticket.findById(req.params.id)
      .populate('user', 'name email')
      .populate('replies.admin', 'name');

    res.status(200).json({ success: true, data: populatedTicket });
  } catch (error) {
    next(error);
  }
};
