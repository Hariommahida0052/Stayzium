const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['Hotel', 'Review'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Investigating', 'Resolved', 'Dismissed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
