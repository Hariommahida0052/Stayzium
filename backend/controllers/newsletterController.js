const sendEmail = require('../utils/sendEmail');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User');
const Hotel = require('../models/Hotel');

const generateNewsletterHTML = async (customSubject, customMessage) => {
  const topHotels = await Hotel.find().limit(2).sort('-rating');
  let hotelCardsHTML = '';

  const backendUrl = process.env.BACKEND_URL || 'https://stayzium-api.onrender.com';
  const frontendUrl = process.env.FRONTEND_URL || 'https://stayzium.vercel.app';

  topHotels.forEach(hotel => {
    let imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
    if (hotel.images && hotel.images[0]) {
      // If the image path is relative (e.g. /uploads/...), make it absolute
      let imagePath = hotel.images[0].replace(/\\/g, '/');
      if (!imagePath.startsWith('http') && !imagePath.startsWith('/')) {
        imagePath = '/' + imagePath;
      }
      imageUrl = imagePath.startsWith('http') ? imagePath : `${backendUrl}${imagePath}`;
      
      // Localhost images will not load in emails due to Mixed Content (HTTP on HTTPS email client)
      if (imageUrl.includes('localhost')) {
        imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
      }
    }
    
    hotelCardsHTML += `
      <!-- Hotel Card -->
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          <tr>
              <td width="200" valign="top">
                  <img src="${imageUrl}" alt="Hotel" width="200" style="display: block; width: 200px; height: 160px; object-fit: cover;" />
              </td>
              <td style="padding: 20px;" valign="top">
                  <h4 style="margin: 0 0 5px 0; color: #111827; font-size: 18px; font-weight: 700;">${hotel.name}</h4>
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">⭐⭐⭐⭐⭐ (${hotel.rating}/5) • ${hotel.location?.city || 'Location'}</p>
                  <div style="margin-bottom: 15px;">
                      <span style="color: #16a34a; font-weight: 700; font-size: 20px;">₹${hotel.pricePerNight}<span style="font-size: 14px; font-weight: normal;">/night</span></span>
                  </div>
                  <a href="${frontendUrl}/hotels/${hotel._id}" style="display: inline-block; background-color: #111827; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 6px;">View Deal</a>
              </td>
          </tr>
      </table>
    `;
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${customSubject || 'Welcome to Stayzium'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 30px; background-color: #ffffff;">
                            <h1 style="margin: 0; color: #2962ff; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Stayzium</h1>
                        </td>
                    </tr>
                    
                    <!-- Hero Image -->
                    <tr>
                        <td>
                            <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80" alt="Luxury Hotel" width="600" style="display: block; width: 100%; max-width: 600px; height: auto;" />
                        </td>
                    </tr>

                    <!-- Welcome Text -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center;">
                            <h2 style="margin: 0 0 15px 0; color: #111827; font-size: 26px; font-weight: 700;">${customSubject || 'Welcome to the Club! 🎉'}</h2>
                            <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 16px; line-height: 26px;">
                                ${customMessage || 'Thank you for subscribing to the Stayzium newsletter! You are now first in line to receive our exclusive hotel offers, secret travel updates, and massive seasonal discounts.'}
                            </p>
                            <a href="${frontendUrl}" style="display: inline-block; background-color: #2962ff; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 36px; border-radius: 8px;">Explore Destinations</a>
                        </td>
                    </tr>

                    <!-- Featured Deals Section -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: 700; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">🔥 Top Deals of the Week</h3>
                            
                            ${hotelCardsHTML}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 40px 30px; background-color: #111827; color: #9ca3af;">
                            <h2 style="margin: 0 0 10px 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Stayzium</h2>
                            <p style="margin: 0 0 25px 0; font-size: 15px;">Your ultimate travel companion.</p>
                            <div style="margin-bottom: 20px;">
                                <a href="${frontendUrl}/privacy" style="color: #ffffff; text-decoration: underline; margin: 0 10px; font-size: 14px;">Privacy Policy</a>
                                <span style="color: #4b5563;">|</span>
                                <a href="${frontendUrl}/terms" style="color: #ffffff; text-decoration: underline; margin: 0 10px; font-size: 14px;">Terms of Service</a>
                            </div>
                            <p style="margin: 0; font-size: 12px; color: #6b7280; line-height: 18px;">
                                You are receiving this email because you opted in via our website.<br/>
                                © 2026 Stayzium Inc. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

exports.sendPromotionalNewsletter = async (req, res, next) => {
  try {
    const { subject, message, html } = req.body;

    if (!subject || (!message && !html)) {
      return res.status(400).json({ success: false, message: 'Please provide subject and message/html' });
    }

    // 1. Get users who opted in
    const users = await User.find({ 'preferences.promotionalOffers': true });
    
    // 2. Get other subscribers
    const subscribers = await Subscriber.find();

    const allEmails = new Set();
    users.forEach(u => allEmails.add(u.email));
    subscribers.forEach(s => allEmails.add(s.email));

    const finalHtml = html || await generateNewsletterHTML(subject, message);

    // Send emails
    for (const email of allEmails) {
      await sendEmail({
        email,
        subject,
        message: message || '',
        html: finalHtml
      });
    }

    res.status(200).json({
      success: true,
      message: `Newsletter sent successfully to ${allEmails.size} recipients.`
    });
  } catch (error) {
    next(error);
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    // Save to Database
    const existingSubscriber = await Subscriber.findOne({ email });
    if (!existingSubscriber) {
      await Subscriber.create({ email });
    }

    const htmlContent = await generateNewsletterHTML('Welcome to the Club! 🎉', 'Thank you for subscribing to the Stayzium newsletter! You are now first in line to receive our exclusive hotel offers, secret travel updates, and massive seasonal discounts.');

    await sendEmail({
      email: email,
      subject: 'Welcome to our Exclusive Newsletter! 🎉',
      html: htmlContent
    });

    res.status(200).json({ success: true, message: 'Subscription successful! Check your email.' });
  } catch (error) {
    console.error('Newsletter Subscription Error:', error);
    res.status(500).json({ success: false, message: 'Could not send the email. Please try again later.' });
  }
};

exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscriber.find().sort('-createdAt');
    res.status(200).json({ success: true, data: subscribers });
  } catch (error) {
    next(error);
  }
};

exports.removeSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }
    res.status(200).json({ success: true, message: 'Subscriber removed successfully' });
  } catch (error) {
    next(error);
  }
};
