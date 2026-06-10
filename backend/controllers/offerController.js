const Offer = require('../models/Offer');

// @desc    Get all active offers (Public)
// @route   GET /api/offers
// @access  Public
exports.getPublicOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find({ 
      isActive: true, 
      validUntil: { $gte: new Date() } // Only future or current dates
    }).populate('participatingHotels', 'name location images');

    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all offers (Admin)
// @route   GET /api/offers/admin
// @access  Private/Admin
exports.getAllOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().populate('participatingHotels', 'name location images');
    res.json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single offer
// @route   GET /api/offers/:id
// @access  Public
exports.getOfferById = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('participatingHotels', 'name location images');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new offer
// @route   POST /api/offers
// @access  Private/Admin
exports.createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    
    // Send Bulk Email Notification
    const { sendBulkPromotionalEmail } = require('../utils/bulkEmailService');
    const { getNewOfferTemplate } = require('../utils/emailTemplates');
    
    // Do not await to avoid blocking the response
    sendBulkPromotionalEmail(
      `Special Offer: ${offer.title}`,
      getNewOfferTemplate(offer.title, offer.discount, offer.description, offer.image)
    );

    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Private/Admin
exports.updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('participatingHotels', 'name location images');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    // Send Bulk Email Notification on Update too!
    if (req.body.title || req.body.discount || req.body.description) {
      const { sendBulkPromotionalEmail } = require('../utils/bulkEmailService');
      const { getNewOfferTemplate } = require('../utils/emailTemplates');
      
      sendBulkPromotionalEmail(
        `Updated Offer: ${offer.title}`,
        getNewOfferTemplate(offer.title, offer.discount, offer.description, offer.image)
      );
    }

    res.json({ success: true, data: offer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Private/Admin
exports.deleteOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    // Delete image from Cloudinary
    if (offer.image) {
      const { deleteFromCloudinary, getPublicIdFromUrl } = require('../utils/cloudinary');
      const publicId = getPublicIdFromUrl(offer.image);
      if (publicId) {
        await deleteFromCloudinary(publicId).catch(err => console.error('Failed to delete offer image from Cloudinary:', err));
      }
    }

    await offer.deleteOne();
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle offer active status
// @route   PUT /api/offers/:id/toggle
// @access  Private/Admin
exports.toggleOfferStatus = async (req, res, next) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    offer.isActive = !offer.isActive;
    await offer.save();
    res.json({ success: true, data: offer, message: `Offer ${offer.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
};
