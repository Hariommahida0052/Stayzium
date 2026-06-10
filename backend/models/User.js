const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Do not return password by default
  },
  role: {
    type: String,
    enum: ['user', 'owner', 'admin'],
    default: 'user'
  },
  age: {
    type: Number,
    min: 18
  },
  contactNumber: {
    type: String
  },
  address: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  profilePicture: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Suspended', 'Rejected'],
    default: 'Active'
  },
  wishlist: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Hotel'
  }],
  preferences: {
    emailNotifications: { type: Boolean, default: true },
    twoFactorAuth: { type: Boolean, default: false },
    promotionalOffers: { type: Boolean, default: false }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  twoFactorOTP: String,
  twoFactorOTPExpire: Date,
}, {
  timestamps: true
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
