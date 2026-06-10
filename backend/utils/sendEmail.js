const sendEmail = async (options) => {
  if (!process.env.BREVO_API_KEY) {
    console.warn("BREVO_API_KEY is not defined. Falling back to Mock Email Service.");
    console.log('===================================================');
    console.log(`[MOCK EMAIL SERVICE] Sending email to: ${options.email}`);
    console.log(`[MOCK EMAIL SERVICE] Subject: ${options.subject}`);
    console.log(`[MOCK EMAIL SERVICE] Message: \n${options.html}`);
    console.log('===================================================');
    return true;
  }

  const isBulk = options.email && options.email.includes(',');
  const toEmails = isBulk 
    ? [{ email: 'noreply@stayzium.com', name: 'Subscribers' }] 
    : [{ email: options.email }];
  
  const bccEmails = isBulk 
    ? options.email.split(',').map(e => ({ email: e.trim() })) 
    : undefined;

  const payload = {
    sender: { 
      email: process.env.EMAIL_USER || 'hetmahida353@gmail.com', 
      name: 'Stayzium Admin' 
    },
    to: toEmails,
    subject: options.subject,
    htmlContent: options.html
  };

  if (bccEmails && bccEmails.length > 0) {
    payload.bcc = bccEmails;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Brevo API Error: ${JSON.stringify(data)}`);
    }

    console.log("Email sent successfully via Brevo:", data.messageId);
    return data;
  } catch (error) {
    console.error("Failed to send email via Brevo API:", error.message);
    console.log('===================================================');
    console.log(`[MOCK EMAIL SERVICE] Sending email to: ${options.email}`);
    console.log(`[MOCK EMAIL SERVICE] Subject: ${options.subject}`);
    console.log('===================================================');
    return true;
  }
};

module.exports = sendEmail;
