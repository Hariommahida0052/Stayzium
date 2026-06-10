const sendEmail = async (options) => {
  // In a real application, you would configure nodemailer here:
  // const transporter = nodemailer.createTransport({ ... });
  // await transporter.sendMail({ ... });
  
  // Since we don't have SMTP credentials, we will mock the email sending.
  console.log('===================================================');
  console.log(`[MOCK EMAIL SERVICE] Sending email to: ${options.email}`);
  console.log(`[MOCK EMAIL SERVICE] Subject: ${options.subject}`);
  console.log(`[MOCK EMAIL SERVICE] Message: \n${options.message}`);
  console.log('===================================================');

  return true;
};

module.exports = sendEmail;
