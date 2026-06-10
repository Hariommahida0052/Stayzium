const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const PlatformSetting = require('../models/PlatformSetting');

// Generate JWT Token
const generateToken = async (id) => {
  let expiresIn = '30d'; // default
  try {
    const settings = await PlatformSetting.findOne();
    if (settings && settings.sessionTimeout) {
      expiresIn = `${settings.sessionTimeout}m`;
    }
  } catch (error) {
    console.error('Error fetching session timeout', error);
  }
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn,
  });
};

const { sendNotification } = require('../utils/notificationService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, age, contactNumber, address, gender } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user', // default to customer if not specified
      age,
      contactNumber,
      address,
      gender
    });

    if (user) {
      // Send welcome notification
      await sendNotification({
        userId: user._id,
        role: user.role,
        title: 'Welcome to Stayzium!',
        message: `Hi ${user.name}, welcome to Stayzium. Start exploring and booking the best hotels!`,
        type: 'user'
      });

      // Send email to admin if a new owner registers
      if (user.role === 'owner') {
        const settings = await PlatformSetting.findOne();
        if (settings && settings.newOwnerSignupEmail && settings.supportEmail) {
          try {
            await sendEmail({
              email: settings.supportEmail,
              subject: 'New Owner Registration - Stayzium',
              html: `
                <h3>New Owner Registered</h3>
                <p>A new property owner has registered on Stayzium.</p>
                <ul>
                  <li><strong>Name:</strong> ${user.name}</li>
                  <li><strong>Email:</strong> ${user.email}</li>
                </ul>
                <p>Please log in to the Admin Dashboard to review their properties.</p>
              `
            });
          } catch (err) {
            console.error('Failed to send owner registration email:', err);
          }
        }
      }

      res.status(201).json({
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
          profilePicture: user.profilePicture
        },
        token: await generateToken(user._id)
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    // Check 2FA requirement
    // Only send OTP if user explicitly enabled twoFactorAuth in their preferences
    if (user.preferences && user.preferences.twoFactorAuth) {
      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.twoFactorOTP = otp;
      user.twoFactorOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();
      
      const { getOTPVerificationTemplate } = require('../utils/emailTemplates');
      
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Login Code - Stayzium',
          html: getOTPVerificationTemplate(otp, user.name)
        });

        return res.status(200).json({
          success: true,
          requires2FA: true,
          userId: user._id,
          message: 'OTP sent to your email.'
        });
      } catch (err) {
        console.error('Failed to send OTP email', err);
        user.twoFactorOTP = undefined;
        user.twoFactorOTPExpire = undefined;
        await user.save();
        return res.status(500).json({ success: false, message: 'Email could not be sent' });
      }
    }

    // If 2FA is not enabled, log them in directly
    res.status(200).json({
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
      },
      token: await generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: 'If the email exists, password reset instructions have been sent.' 
      });
    }

    // Generate token
    const resetToken = user.getResetPasswordToken();
    
    // Save token fields to DB
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host').replace('5000', '3000')}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #eaeaea;">
        <div style="background-color: #2962ff; padding: 30px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">Stayzium</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #333333; margin-top: 0; margin-bottom: 20px; font-size: 22px;">Password Reset Request</h2>
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hello,
          </p>
          <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            We received a request to reset the password for your Stayzium account. If you made this request, please click the button below to set a new password.
          </p>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${resetUrl}" style="background-color: #2962ff; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(41,98,255,0.3);">
              Reset Password
            </a>
          </div>
          <p style="color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin-bottom: 30px; word-break: break-all;">
            <a href="${resetUrl}" style="color: #2962ff; font-size: 14px;">${resetUrl}</a>
          </p>
          <p style="color: #777777; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged. This link will expire in 10 minutes.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="color: #999999; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Stayzium Booking. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Stayzium - Password Reset Request',
        html
      });

      res.status(200).json({
        success: true,
        message: 'If the email exists, password reset instructions have been sent.'
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: await generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-2fa
// @access  Public
exports.verify2FA = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide userId and OTP' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.twoFactorOTP !== otp) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    if (Date.now() > user.twoFactorOTPExpire) {
      return res.status(401).json({ success: false, message: 'OTP has expired. Please log in again.' });
    }

    // Clear OTP fields
    user.twoFactorOTP = undefined;
    user.twoFactorOTPExpire = undefined;
    await user.save({ validateBeforeSave: false });

    // Send successful login response with token
    res.status(200).json({
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
        profilePicture: user.profilePicture
      },
      token: await generateToken(user._id)
    });
  } catch (error) {
    next(error);
  }
};
