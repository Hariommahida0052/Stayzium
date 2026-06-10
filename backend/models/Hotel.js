const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hotel name'],
    trim: true,
    maxlength: [100, 'Name can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    city: {
      type: String,
      required: [true, 'Please add a city']
    },
    country: {
      type: String,
      required: [true, 'Please add a country']
    }
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Please add price per night']
  },
  amenities: {
    type: [String],
    required: true
  },
  images: {
    type: [String],
    default: ['/images/room.png']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  propertyType: {
    type: String,
    enum: ['Hotel', 'Resort', 'Tent', 'Villa', 'Apartment'],
    default: 'Hotel'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending' // Changed default from 'approved' to 'pending'
  },
  rejectionReason: {
    type: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 4.5
  },
  reviewsCount: {
    type: Number,
    default: 120
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);
