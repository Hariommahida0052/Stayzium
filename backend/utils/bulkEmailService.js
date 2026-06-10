const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const sendEmail = require('./sendEmail');

const sendBulkPromotionalEmail = async (subject, htmlContent) => {
  try {
    // Find registered users who have emailNotifications enabled
    const users = await User.find({
      'preferences.emailNotifications': true
    }).select('email');

    // Find all newsletter subscribers
    const subscribers = await Subscriber.find().select('email');

    // Combine emails from both users and subscribers
    const emailSet = new Set();
    
    users.forEach(u => emailSet.add(u.email));
    subscribers.forEach(s => emailSet.add(s.email));

    const emailList = Array.from(emailSet);

    if (emailList.length === 0) {
      console.log('No eligible users or subscribers found for promotional email.');
      return;
    }

    // Send the email. We use BCC so users don't see each other's emails.
    // Nodemailer supports sending to multiple recipients via BCC.
    await sendEmail({
      email: emailList.join(', '), // Nodemailer can take comma separated list
      subject: subject,
      html: htmlContent
    });

    console.log(`Successfully sent promotional email "${subject}" to ${emailList.length} users.`);
  } catch (error) {
    console.error('Error sending bulk promotional email:', error);
  }
};

module.exports = {
  sendBulkPromotionalEmail
};
