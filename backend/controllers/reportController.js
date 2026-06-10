const Report = require('../models/Report');

// @desc    Get all reports
// @route   GET /api/reports/admin
// @access  Private/Admin
exports.getAllReports = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    let query = {};
    
    if (status && status !== 'All Statuses') {
      query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    }
    
    if (search) {
      query.reason = { $regex: search, $options: 'i' };
    }

    const reports = await Report.find(query)
      .populate('reportedBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({ 
      success: true, 
      data: reports,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Report fetch error:', error);
    next(error);
  }
};

// @desc    Update report status
// @route   PUT /api/reports/admin/:id/status
// @access  Private/Admin
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    
    report.resolvedBy = req.user._id;
    
    await report.save();
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
