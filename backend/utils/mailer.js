// backend/utils/mailer.js
require('dotenv').config();
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

// verify connection once at startup
transporter.verify((err, success) => {
  if (err) {
    console.error("✉️ Email transporter verify failed:", err.message);
  } else {
    console.log("✉️ Email transporter ready");
  }
});

async function sendEmail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  });
  console.log('Email sent:', info.messageId);
  return info;
}

module.exports = { sendEmail };
