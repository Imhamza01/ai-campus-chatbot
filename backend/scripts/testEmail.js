// backend/scripts/testEmail.js
const { sendEmail } = require('../utils/mailer');
(async () => {
  try {
    await sendEmail({ to: 'hamzaqurashi9mm@gmail.com', subject: 'Test', text: 'Hello' });
    console.log('OK');
  } catch (e) {
    console.error('send failed', e.message);
  }
})();
