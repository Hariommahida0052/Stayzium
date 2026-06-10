const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['completed'],
    default: 'completed'
  },
  transactionId: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payout', payoutSchema);
