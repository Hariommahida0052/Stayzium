const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  targetId: {
    type: mongoose.Schema.Types.Mixed
  },
  targetModel: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
