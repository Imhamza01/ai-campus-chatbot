// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ to, subject, html }) {
  let attempts = 0;
  while (attempts < 3) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      console.log('Email sent:', info.messageId);
      return info;
    } catch (err) {
      attempts++;
      console.error(`Email send failed (attempt ${attempts}):`, err.message);
      if (attempts >= 3) throw err;
      await new Promise(r => setTimeout(r, 3000)); // retry after 3 seconds
    }
  }
}
async function sendEmailWithRetry(options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await sendEmail(options);
    } catch (err) {
      console.error(`Email send failed, attempt ${i + 1}:`, err.message);
      await new Promise(res => setTimeout(res, 2000)); // 2 sec wait
    }
  }
  console.error('All email attempts failed:', options);
}



module.exports = { sendEmail,sendEmailWithRetry };
