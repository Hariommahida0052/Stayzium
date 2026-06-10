const Booking = require('../models/Booking');
const Payout = require('../models/Payout');
const PlatformSetting = require('../models/PlatformSetting');
const Hotel = require('../models/Hotel');

// @desc    Get all pending payouts grouped by owner (Admin)
// @route   GET /api/payouts/admin/pending
exports.getAdminPendingPayouts = async (req, res) => {
  try {
    const settings = await PlatformSetting.findOne();
    const commissionRate = settings ? settings.globalCommissionRate : 10;

    const bookings = await Booking.find({ 
      status: { $in: ['confirmed', 'completed'] }, 
      ownerPayoutStatus: { $ne: 'paid' } 
    }).populate({
      path: 'hotel',
      select: 'name owner',
      populate: { path: 'owner', select: 'name email profilePicture contactNumber' }
    });

    // Group by owner
    const ownersMap = {};

    bookings.forEach(booking => {
      if (!booking.hotel || !booking.hotel.owner) return;
      const ownerId = booking.hotel.owner._id.toString();
      
      if (!ownersMap[ownerId]) {
        ownersMap[ownerId] = {
          owner: booking.hotel.owner,
          totalPending: 0,
          bookingCount: 0,
          bookings: []
        };
      }

      const commission = (booking.totalAmount * commissionRate) / 100;
      const ownerEarned = booking.totalAmount - commission;

      ownersMap[ownerId].totalPending += ownerEarned;
      ownersMap[ownerId].bookingCount += 1;
      ownersMap[ownerId].bookings.push(booking._id);
    });

    const result = Object.values(ownersMap);

    res.status(200).json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Mark an owner's pending balance as paid (Admin)
// @route   POST /api/payouts/admin/pay/:ownerId
exports.markAsPaid = async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    
    // Find hotels owned by this owner
    const hotels = await Hotel.find({ owner: ownerId }).select('_id');
    const hotelIds = hotels.map(h => h._id);

    const settings = await PlatformSetting.findOne();
    const commissionRate = settings ? settings.globalCommissionRate : 10;

    // Find all pending completed bookings for these hotels
    const bookings = await Booking.find({
      hotel: { $in: hotelIds },
      status: { $in: ['confirmed', 'completed'] },
      ownerPayoutStatus: { $ne: 'paid' }
    });

    if (bookings.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending payouts for this owner' });
    }

    let totalPayoutAmount = 0;
    const bookingIds = [];

    bookings.forEach(b => {
      const commission = (b.totalAmount * commissionRate) / 100;
      totalPayoutAmount += (b.totalAmount - commission);
      bookingIds.push(b._id);
    });

    // Create Payout Record
    const payout = await Payout.create({
      owner: ownerId,
      admin: req.user.id,
      amount: totalPayoutAmount,
      status: 'completed',
      notes: `Payout for ${bookings.length} bookings`
    });

    // Update Bookings
    await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { $set: { ownerPayoutStatus: 'paid' } }
    );

    res.status(200).json({ success: true, data: payout, message: 'Payout marked as paid successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get logged in owner's wallet summary (Owner)
// @route   GET /api/payouts/owner/summary
exports.getOwnerWalletSummary = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const hotels = await Hotel.find({ owner: ownerId }).select('_id');
    const hotelIds = hotels.map(h => h._id);

    const settings = await PlatformSetting.findOne();
    const commissionRate = settings ? settings.globalCommissionRate : 10;

    // Pending Bookings
    const pendingBookings = await Booking.find({
      hotel: { $in: hotelIds },
      status: { $in: ['confirmed', 'completed'] },
      ownerPayoutStatus: { $ne: 'paid' }
    });

    let pendingBalance = 0;
    pendingBookings.forEach(b => {
      const commission = (b.totalAmount * commissionRate) / 100;
      pendingBalance += (b.totalAmount - commission);
    });

    // Payout History
    const payouts = await Payout.find({ owner: ownerId })
      .sort('-createdAt')
      .populate('admin', 'name email');

    let totalWithdrawn = 0;
    payouts.forEach(p => {
      totalWithdrawn += p.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        pendingBalance,
        totalWithdrawn,
        payouts
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
