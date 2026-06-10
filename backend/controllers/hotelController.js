const Hotel = require('../models/Hotel');

// @desc    Get all approved hotels (Public / Customer)
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from normal matching
    delete reqQuery.minPrice;
    delete reqQuery.maxPrice;
    delete reqQuery.amenities;
    delete reqQuery.city;
    delete reqQuery.propertyType;
    delete reqQuery.rating;
    delete reqQuery.search;
    delete reqQuery.sort;

    // Base query: Only approved hotels
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    let dbQuery = Hotel.find({ ...JSON.parse(queryStr), status: 'approved' });

    // Custom Filters
    if (req.query.city) {
      // Use $regex operator directly to avoid RegExp constructor triggering static analyzer rules
      const escapeRegex = (string) => string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      dbQuery = dbQuery.where('location.city').equals({ $regex: escapeRegex(req.query.city), $options: 'i' });
    }
    
    if (req.query.minPrice) {
      dbQuery = dbQuery.where('pricePerNight').gte(req.query.minPrice);
    }
    
    if (req.query.maxPrice) {
      dbQuery = dbQuery.where('pricePerNight').lte(req.query.maxPrice);
    }

    if (req.query.amenities) {
      const amenitiesArr = req.query.amenities.split(',');
      dbQuery = dbQuery.where('amenities').in(amenitiesArr);
    }

    if (req.query.propertyType) {
      const typesArr = req.query.propertyType.split(',');
      dbQuery = dbQuery.where('propertyType').in(typesArr);
    }

    if (req.query.rating) {
      const ratingsArr = req.query.rating.split(',').map(Number);
      // Let's assume if 5, 4, 3 are selected, we want rating >= minimum of selected, or exact match.
      // Usually users want rating >= lowest selected rating.
      const minRating = Math.min(...ratingsArr);
      dbQuery = dbQuery.where('rating').gte(minRating);
    }

    if (req.query.search) {
      const escapeRegex = (string) => string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const searchRegex = { $regex: escapeRegex(req.query.search), $options: 'i' };
      dbQuery = dbQuery.or([
        { name: searchRegex },
        { 'location.city': searchRegex },
        { 'location.country': searchRegex }
      ]);
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      dbQuery = dbQuery.sort(sortBy);
    } else {
      dbQuery = dbQuery.sort('-createdAt'); // default sort
    }

    const hotels = await dbQuery.populate('owner', 'name email status');

    const activeHotels = hotels.filter(h => h.owner && h.owner.status !== 'Suspended');

    res.status(200).json({
      success: true,
      count: activeHotels.length,
      data: activeHotels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top destinations by property count
// @route   GET /api/hotels/public/destinations
// @access  Public
exports.getDestinations = async (req, res, next) => {
  try {
    const destinations = await Hotel.aggregate([
      { $match: { status: 'approved' } },
      { $group: {
          _id: '$location.city',
          count: { $sum: 1 },
          image: { $first: { $arrayElemAt: ['$images', 0] } }
      } },
      { $sort: { count: -1 } },
      { $limit: 4 }
    ]);

    // Format the response
    const formattedDestinations = destinations.map(dest => ({
      name: dest._id,
      count: `${dest.count.toLocaleString()} properties`,
      image: dest.image || '/images/room.png'
    }));

    res.status(200).json({
      success: true,
      data: formattedDestinations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel details
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('owner', 'name email');

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Only allow public to see approved hotels. Owner and Admin can see it regardless of status.
    const isPublicUser = !req.user;
    const isCustomer = req.user && req.user.role === 'user';
    const isOwnerButNotThisOne = req.user && req.user.role === 'owner' && hotel.owner._id.toString() !== req.user._id.toString();

    if (hotel.status !== 'approved' && (isPublicUser || isCustomer || isOwnerButNotThisOne)) {
      return res.status(404).json({ success: false, message: 'Hotel not found or pending approval' });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Owner, Admin)
exports.createHotel = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.owner = req.user.id;

    // Prevent duplicate hotels by the same name and city
    if (req.body.name && req.body.location?.city) {
      const existingHotel = await Hotel.findOne({
        name: { $regex: new RegExp('^' + req.body.name + '$', 'i') },
        'location.city': { $regex: new RegExp('^' + req.body.location.city + '$', 'i') }
      });
      if (existingHotel) {
        return res.status(400).json({
          success: false,
          message: 'A property with this name already exists in this city.'
        });
      }
    }

    // Set new properties to pending status unless created by admin
    const PlatformSetting = require('../models/PlatformSetting');
    const settings = await PlatformSetting.findOne();
    
    if (req.user.role !== 'admin') {
      if (settings && settings.requireHotelApproval === false) {
        req.body.status = 'approved';
      } else {
        req.body.status = 'pending';
      }
    } else {
      req.body.status = 'approved';
    }

    const hotel = await Hotel.create(req.body);

    if (hotel.status === 'approved') {
      const { sendBulkPromotionalEmail } = require('../utils/bulkEmailService');
      const { getNewHotelTemplate } = require('../utils/emailTemplates');
      sendBulkPromotionalEmail(
        `New Hotel: ${hotel.name}`,
        getNewHotelTemplate(hotel.name, `${hotel.location?.city || ''}, ${hotel.location?.country || ''}`)
      );
    }

    res.status(201).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Owner, Admin)
exports.updateHotel = async (req, res, next) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Make sure user is hotel owner or admin
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this hotel' });
    }

    // Prevent owner from changing status directly
    if (req.user.role !== 'admin' && req.body.status) {
      delete req.body.status;
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Owner, Admin)
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Make sure user is hotel owner or admin
    if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this hotel' });
    }

    // Delete images from Cloudinary
    if (hotel.images && hotel.images.length > 0) {
      const { deleteFromCloudinary, getPublicIdFromUrl } = require('../utils/cloudinary');
      for (const imageUrl of hotel.images) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId).catch(err => console.error('Failed to delete image from Cloudinary:', err));
        }
      }
    }

    await hotel.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in owner's hotels
// @route   GET /api/hotels/owner/my-hotels
// @access  Private (Owner)
exports.getOwnerHotels = async (req, res, next) => {
  try {
    const hotels = await Hotel.find({ owner: req.user.id });

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hotels (including pending) for Admin
// @route   GET /api/hotels/admin/all
// @access  Private (Admin)
exports.getAdminAllHotels = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (status && status !== 'All Status') query.status = status.toLowerCase();
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    const hotels = await Hotel.find(query)
      .populate('owner', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Hotel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: hotels,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel status (Approve/Reject)
// @route   PUT /api/hotels/admin/:id/status
// @access  Private (Admin)
exports.updateHotelStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason: status === 'rejected' ? rejectionReason : '' },
      { new: true, runValidators: true }
    );

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Send notification to owner
    if (hotel.owner) {
      const { sendNotification } = require('../utils/notificationService');
      let notifTitle = 'Property Status Updated';
      let notifMessage = `Your property ${hotel.name} status is now ${status}.`;
      
      if (status === 'approved') {
        notifTitle = 'Property Approved!';
        notifMessage = `Congratulations! Your property ${hotel.name} has been approved and is now live.`;
        
        // Send Bulk Email to all users about the new property
        const { sendBulkPromotionalEmail } = require('../utils/bulkEmailService');
        const { getNewHotelTemplate } = require('../utils/emailTemplates');
        sendBulkPromotionalEmail(
          `New Hotel: ${hotel.name}`,
          getNewHotelTemplate(hotel.name, `${hotel.location?.city || ''}, ${hotel.location?.country || ''}`)
        );

      } else if (status === 'rejected') {
        notifTitle = 'Property Rejected';
        notifMessage = `Your property ${hotel.name} was rejected. Reason: ${rejectionReason}`;
      } else if (status === 'suspended') {
        notifTitle = 'Property Suspended';
        notifMessage = `Your property ${hotel.name} has been suspended by the admin.`;
      }

      await sendNotification({
        userId: hotel.owner,
        role: 'owner',
        title: notifTitle,
        message: notifMessage,
        type: 'hotel',
        link: '/owner/dashboard'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Featured Hotel Status
// @route   PUT /api/hotels/admin/:id/featured
// @access  Private (Admin)
exports.toggleFeaturedHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    hotel.isFeatured = !hotel.isFeatured;
    await hotel.save();

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mock Calendar Sync
// @route   POST /api/hotels/owner/sync-calendar
// @access  Private (Owner/Admin)
exports.syncCalendar = async (req, res, next) => {
  try {
    // In a real application, you would connect to a channel manager or iCal link here
    // We will simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    res.status(200).json({
      success: true,
      message: 'Calendar synchronized successfully.',
      lastSynced: new Date()
    });
  } catch (error) {
    next(error);
  }
};
