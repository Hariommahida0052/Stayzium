const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an offer title'],
    trim: true
  },
  discount: {
    type: String,
    required: [true, 'Please add a discount value (e.g., 20% OFF)']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  validUntil: {
    type: Date,
    required: [true, 'Please specify validity date']
  },
  image: {
    type: String,
    required: [true, 'Please add an image URL']
  },
  color: {
    type: String,
    default: 'bg-blue-500' // Tailwind color class for styling the discount tag
  },
  isActive: {
    type: Boolean,
    default: true
  },
  participatingHotels: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Offer', offerSchema);
