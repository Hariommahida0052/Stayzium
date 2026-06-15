const getBaseTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f7f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 650px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        .header {
          background-color: #ffffff;
          color: #111827;
          padding: 25px 40px;
          text-align: center;
          border-bottom: 1px solid #f3f4f6;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #2563eb;
        }
        .content {
          padding: 40px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px 40px;
          text-align: center;
          font-size: 14px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .btn {
          display: inline-block;
          background-color: #2962ff;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 20px;
        }
        .otp-code {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 5px;
          color: #2962ff;
          text-align: center;
          padding: 20px;
          background-color: #f0f4ff;
          border-radius: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Stayzium</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Stayzium. All rights reserved.</p>
          <p>You are receiving this email because you are registered on Stayzium.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.getOTPVerificationTemplate = (otp, name) => {
  const content = `
    <h2>Hello ${name},</h2>
    <p>Please use the following 6-digit code to complete your login securely.</p>
    <div class="otp-code">${otp}</div>
    <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
  `;
  return getBaseTemplate('Your Login OTP', content);
};

exports.getNewOfferTemplate = (offerName, discount, description, imageUrl) => {
  const content = `
    <!-- Hero Image Section -->
    ${imageUrl ? `
    <div style="margin: -40px -40px 30px -40px;">
      <img src="${imageUrl}" alt="${offerName}" style="width: 100%; max-height: 350px; object-fit: cover; display: block;" />
    </div>
    ` : ''}
    
    <h2 style="color: #111827; font-size: 28px; margin-bottom: 10px; text-align: center; font-weight: 800;">Special Deal: ${offerName}</h2>
    <p style="font-size: 16px; color: #4b5563; text-align: center; margin-bottom: 30px;">We've handpicked an incredible offer just for you.</p>
    
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; margin: 0 auto 30px auto; text-align: center; max-width: 80%;">
      <h3 style="margin: 0 0 15px 0; color: #3b82f6; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Exclusive Discount</h3>
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; display: inline-block; padding: 12px 24px; border-radius: 30px; font-weight: 800; font-size: 22px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);">
        ${discount}
      </div>
      <p style="margin: 20px 0 0 0; color: #1f2937; font-size: 16px; line-height: 1.5;">${description}</p>
    </div>
    
    <p style="font-size: 15px; color: #6b7280; text-align: center; margin-bottom: 25px;">Don't miss out! Log in to Stayzium now to claim this offer before it expires.</p>
    
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'https://stayzium.vercel.app'}/offers" class="btn" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); transition: all 0.2s;">Claim Offer Now</a>
    </div>
  `;
  return getBaseTemplate(`Special Offer: ${offerName}`, content);
};

exports.getNewHotelTemplate = (hotelName, location) => {
  const content = `
    <h2>New Property Added!</h2>
    <p>A beautiful new property has just been published on Stayzium.</p>
    <h3>🏨 ${hotelName}</h3>
    <p>📍 Location: ${location}</p>
    <p>Discover our latest addition and book your next stay today!</p>
    <center><a href="${process.env.FRONTEND_URL || 'https://stayzium.vercel.app'}/hotels" class="btn">Explore Properties</a></center>
  `;
  return getBaseTemplate(`New Hotel: ${hotelName}`, content);
};

exports.getNewRoomTemplate = (hotelName, roomType) => {
  const content = `
    <h2>New Rooms Available!</h2>
    <p>Great news! <strong>${hotelName}</strong> has just added new <strong>${roomType}</strong> rooms.</p>
    <p>If you're planning a trip, be sure to check out these brand new accommodations.</p>
    <center><a href="${process.env.FRONTEND_URL || 'https://stayzium.vercel.app'}/hotels" class="btn">Book a Room</a></center>
  `;
  return getBaseTemplate(`New Rooms at ${hotelName}`, content);
};

exports.getBookingConfirmationTemplate = (bookingId, hotelName, checkIn, checkOut) => {
  const content = `
    <h2>Booking Confirmed!</h2>
    <p>Your reservation is confirmed. Here are the details:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Booking ID</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${bookingId}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Hotel</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${hotelName}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-in</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(checkIn).toLocaleDateString()}</td></tr>
      <tr><td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Check-out</strong></td><td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date(checkOut).toLocaleDateString()}</td></tr>
    </table>
    <p>We look forward to hosting you!</p>
  `;
  return getBaseTemplate('Booking Confirmation', content);
};

exports.getBookingCancellationTemplate = (bookingId, hotelName) => {
  const content = `
    <h2>Booking Cancelled</h2>
    <p>Your reservation at <strong>${hotelName}</strong> (ID: ${bookingId}) has been cancelled successfully.</p>
    <p>If you have any questions or wish to book again, please visit our platform.</p>
  `;
  return getBaseTemplate('Booking Cancelled', content);
};

exports.getPasswordResetTemplate = (resetUrl) => {
  const content = `
    <h2>Password Reset Request</h2>
    <p>You requested to reset your password. Click the button below to set a new password.</p>
    <center><a href="${resetUrl}" class="btn">Reset Password</a></center>
    <p style="margin-top: 20px; font-size: 13px; color: #666;">If you did not make this request, you can safely ignore this email.</p>
  `;
  return getBaseTemplate('Reset Your Password', content);
};
