const User = require('../models/User');
const Booking = require('../models/Booking');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          age: user.age,
          contactNumber: user.contactNumber,
          address: user.address,
          gender: user.gender,
          profilePicture: user.profilePicture,
          preferences: user.preferences
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.name !== undefined) user.name = req.body.name;
      if (req.body.email !== undefined) user.email = req.body.email;
      if (req.body.age !== undefined) user.age = req.body.age;
      if (req.body.contactNumber !== undefined) user.contactNumber = req.body.contactNumber;
      if (req.body.address !== undefined) user.address = req.body.address;
      if (req.body.gender !== undefined) user.gender = req.body.gender;
      if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;
      if (req.body.preferences !== undefined) {
        if (req.body.preferences.emailNotifications !== undefined) user.preferences.emailNotifications = req.body.preferences.emailNotifications;
        if (req.body.preferences.twoFactorAuth !== undefined) user.preferences.twoFactorAuth = req.body.preferences.twoFactorAuth;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          age: updatedUser.age,
          contactNumber: updatedUser.contactNumber,
          address: updatedUser.address,
          gender: updatedUser.gender,
          profilePicture: updatedUser.profilePicture,
          preferences: updatedUser.preferences
        }
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/profile/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect current password' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
exports.getUserDashboardStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const bookings = await Booking.find({ user: req.user._id }).populate('hotel');
    
    let pastBookingsCount = 0;
    let upcomingBookingsCount = 0;
    let totalSpent = 0;

    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    
    // Nearest upcoming booking
    let nextAdventure = null;

    bookings.forEach(booking => {
      const checkOut = new Date(booking.checkOutDate);
      checkOut.setHours(0, 0, 0, 0);

      const checkIn = new Date(booking.checkInDate);
      checkIn.setHours(0, 0, 0, 0);

      if (booking.status === 'completed' || (checkOut < now && booking.status !== 'cancelled')) {
        if(booking.status !== 'cancelled') {
           pastBookingsCount++;
           totalSpent += booking.totalAmount || 0;
        }
      } else if ((booking.status === 'confirmed' || booking.status === 'pending') && checkOut >= now) {
        upcomingBookingsCount++;
        
        if (!nextAdventure || checkIn < new Date(nextAdventure.checkInDate)) {
           nextAdventure = booking;
        }
      }
    });

    res.json({
      success: true,
      data: {
        upcomingTrips: upcomingBookingsCount,
        pastBookings: pastBookingsCount,
        savedPlaces: user.wishlist ? user.wishlist.length : 0,
        rewardPoints: Math.floor(totalSpent / 100),
        nextAdventure
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN ROUTES
// ==========================================

// @desc    Get all users with filtering/pagination
// @route   GET /api/users/admin
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: users,
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

// @desc    Get single user details
// @route   GET /api/users/admin/:id
// @access  Private (Admin)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (Suspend, Activate, Approve Owner)
// @route   PUT /api/users/admin/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.status = status;
    await user.save();

    const Hotel = require('../models/Hotel');
    if (status === 'Suspended') {
      await Hotel.updateMany({ owner: user._id }, { status: 'suspended' });
    } else if (status === 'Active' && user.role === 'owner') {
      await Hotel.updateMany({ owner: user._id, status: 'suspended' }, { status: 'pending' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user verification (for owners)
// @route   PUT /api/users/admin/:id/verify
// @access  Private (Admin)
exports.toggleUserVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/admin/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.deleteOne();
    
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json({ success: true, data: user.wishlist || [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle hotel in wishlist
// @route   POST /api/users/wishlist/:hotelId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { hotelId } = req.params;

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const isExist = user.wishlist.includes(hotelId);

    if (isExist) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== hotelId);
    } else {
      user.wishlist.push(hotelId);
    }

    await user.save();
    res.json({ success: true, isWishlisted: !isExist, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};
