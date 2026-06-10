const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a review text']
  },
  hotel: {
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per hotel
reviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function (hotelId) {
  const obj = await this.aggregate([
    {
      $match: { hotel: hotelId }
    },
    {
      $group: {
        _id: '$hotel',
        averageRating: { $avg: '$rating' },
        reviewsCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await this.model('Hotel').findByIdAndUpdate(hotelId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        reviewsCount: obj[0].reviewsCount
      });
    } else {
      await this.model('Hotel').findByIdAndUpdate(hotelId, {
        rating: 0,
        reviewsCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.hotel);
});

// Call getAverageRating after remove
// We will use post('findOneAndDelete') because we usually delete via Model.findByIdAndDelete
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.getAverageRating(doc.hotel);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
