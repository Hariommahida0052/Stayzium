const { Resend } = require('resend');

const sendEmail = async (options) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not defined. Falling back to Mock Email Service.");
    console.log('===================================================');
    console.log(`[MOCK EMAIL SERVICE] Sending email to: ${options.email}`);
    console.log(`[MOCK EMAIL SERVICE] Subject: ${options.subject}`);
    console.log(`[MOCK EMAIL SERVICE] Message: \n${options.html}`);
    console.log('===================================================');
    return true;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const isBulk = options.email && options.email.includes(',');
  const toEmail = isBulk ? 'noreply@stayzium.com' : options.email;
  const bccEmail = isBulk ? options.email.split(',') : undefined;

  try {
    const data = await resend.emails.send({
      from: 'Stayzium <onboarding@resend.dev>', 
      to: toEmail,
      bcc: bccEmail,
      subject: options.subject,
      html: options.html,
    });

    console.log("Email sent successfully via Resend:", data.id);
    return data;
  } catch (error) {
    console.error("Failed to send email via Resend API:", error.message);
    console.log('===================================================');
    console.log(`[MOCK EMAIL SERVICE] Sending email to: ${options.email}`);
    console.log(`[MOCK EMAIL SERVICE] Subject: ${options.subject}`);
    console.log(`[MOCK EMAIL SERVICE] Message: \n${options.html}`);
    console.log('===================================================');
    return true;
  }
};

module.exports = sendEmail;
