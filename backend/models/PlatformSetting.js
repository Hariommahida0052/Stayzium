const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema({
  platformName: { type: String, default: 'Stayzium' },
  supportEmail: { type: String, default: 'support@stayzium.com' },
  defaultCurrency: { type: String, default: 'INR' },
  maintenanceMode: { type: Boolean, default: false },
  require2FA: { type: Boolean, default: true },
  sessionTimeout: { type: Number, default: 30 },
  
  // New Practical Features
  requireHotelApproval: { type: Boolean, default: true },
  requireOwnerVerification: { type: Boolean, default: true },
  globalCommissionRate: { type: Number, default: 10 },
  maxAdvanceBookingDays: { type: Number, default: 365 },
  cancellationPolicy: { 
    type: String, 
    default: 'Free cancellation up to 48 hours before check-in. After that, a cancellation fee of 1 night will apply.' 
  }
}, { timestamps: true });

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
