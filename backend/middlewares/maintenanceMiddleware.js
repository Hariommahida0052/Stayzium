const PlatformSetting = require('../models/PlatformSetting');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.checkMaintenanceMode = async (req, res, next) => {
  try {
    const settings = await PlatformSetting.findOne();
    
    // If maintenance mode is off, or if no settings exist, continue
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // Check if the user is an admin by manually verifying the token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        const user = await User.findById(decoded.id).select('role');
        
        if (user && user.role === 'admin') {
          return next(); // Allow admin to bypass
        }
      } catch (err) {
        // Token is invalid, ignore and proceed to block
      }
    }

    // Allow login routes so admin can actually login during maintenance
    if (req.path.includes('/api/auth/login')) {
      return next();
    }

    // Block the request
    return res.status(503).json({
      success: false,
      message: 'The platform is currently under maintenance. Please try again later.'
    });

  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    next();
  }
};
