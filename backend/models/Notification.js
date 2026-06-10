const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'hotel', 'room', 'user', 'system', 'report', 'review', 'offer', 'ticket'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  link: {
    type: String // Optional frontend route to navigate when clicked
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
