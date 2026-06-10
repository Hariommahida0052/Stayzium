const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  guests: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected', 'refunded'],
    default: 'none'
  },
  bookingSource: {
    type: String,
    enum: ['Direct', 'Social', 'Referral'],
    default: 'Direct'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  ownerPayoutStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
