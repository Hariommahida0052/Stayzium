const PlatformSetting = require('../models/PlatformSetting');

// @desc    Get public platform settings
// @route   GET /api/settings/public
// @access  Public
exports.getPublicSettings = async (req, res, next) => {
  try {
    const settings = await PlatformSetting.findOne().select('platformName supportEmail cancellationPolicy defaultCurrency');
    res.status(200).json({ success: true, data: settings || {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSetting.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await PlatformSetting.create({});
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update platform settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSetting.findOne();

    if (!settings) {
      settings = await PlatformSetting.create({});
    }

    // Remove immutable fields to prevent MongoServerError
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;

    // Update fields
    const updatedSettings = await PlatformSetting.findByIdAndUpdate(
      settings._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) {
    next(error);
  }
};
