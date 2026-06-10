const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a room title (e.g., Deluxe Double Room)'],
  },
  price: {
    type: Number,
    required: [true, 'Please add room price per night'],
  },
  maxPeople: {
    type: Number,
    required: [true, 'Please specify maximum people allowed'],
  },
  desc: {
    type: String,
    required: [true, 'Please add a room description'],
  },
  images: {
    type: [String],
    default: []
  },
  type: {
    type: String,
    default: 'Standard'
  },
  bedType: {
    type: String,
    default: 'Double'
  },
  roomSize: {
    type: String,
    default: ''
  },
  facilities: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['Available', 'Maintenance'],
    default: 'Available'
  },
  // We store individual room instances (e.g. 101, 102) of this room type
  // and their specific unavailable dates due to bookings.
  roomNumbers: [{
    number: Number,
    unavailableDates: { type: [Date] }
  }],
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
