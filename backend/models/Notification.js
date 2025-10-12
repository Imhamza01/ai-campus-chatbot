// utils/notifications.js
const Notification = require('../models/Notification');

const createNotification = async (userId, message, link = null) => {
  try {
    const notification = new Notification({ user: userId, message, link });
    await notification.save();
    console.log(`✅ Notification created for user: ${userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error.message);
  }
};

module.exports = { createNotification };
