const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  let transporter;

  // Use real credentials if provided in .env, otherwise use Ethereal (dummy) for testing
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail', // You can change this based on your provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } else {
    // Generate test SMTP service account from ethereal.email
    let testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log("Using Ethereal for testing. Email credentials generated.");
  }

  const isBulk = options.email && options.email.includes(',');
  const mailOptions = {
    from: process.env.EMAIL_USER ? `"Stayzium Admin" <${process.env.EMAIL_USER}>` : '"Stayzium Admin" <noreply@stayzium.com>',
    to: isBulk ? 'noreply@hotelbooking.com' : options.email,
    bcc: isBulk ? options.email : undefined,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!process.env.EMAIL_USER) {
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }

  return info;
};

module.exports = sendEmail;
