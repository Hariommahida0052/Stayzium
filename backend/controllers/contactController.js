const sendEmail = require('../utils/sendEmail');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
exports.submitContactForm = async (req, res, next) => {
  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const htmlMessage = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-w-xl; min-width: 320px; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">Stayzium</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">New Support Request</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px;">Contact Details</h2>
              
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                <tr>
                  <td width="30%" style="padding: 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase;">Name</td>
                  <td width="70%" style="padding: 10px 0; color: #111827; font-size: 16px; font-weight: 500;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td width="30%" style="padding: 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase;">Email</td>
                  <td width="70%" style="padding: 10px 0; color: #2563eb; font-size: 16px; font-weight: 500;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td width="30%" style="padding: 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase;">Subject</td>
                  <td width="70%" style="padding: 10px 0; color: #111827; font-size: 16px; font-weight: 500;">${subject}</td>
                </tr>
              </table>

              <h2 style="color: #1f2937; font-size: 20px; margin: 0 0 15px 0;">Message</h2>
              <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; border-radius: 0 8px 8px 0; color: #334155; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
              
              <div style="margin-top: 35px; text-align: center;">
                <a href="mailto:${email}?subject=Re: ${subject}" style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Reply to Customer</a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 13px; margin: 0;">This email was securely sent from your Stayzium contact form.</p>
              <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Stayzium Inc. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // Send the email to the support email address
    // process.env.EMAIL_USER should be the address where support emails go (hetmahida353@gmail.com)
    const supportEmail = process.env.EMAIL_USER || 'hetmahida353@gmail.com';

    await sendEmail({
      email: supportEmail,
      subject: `Stayzium Contact: ${subject}`,
      html: htmlMessage,
    });

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
    });
  } catch (error) {
    console.error('Contact form error:', error);
    next(error);
  }
};
