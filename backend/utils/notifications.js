const Notification = require("../models/Notification");

async function createNotification(userId, message, link = "") {
  try {
    const notification = await Notification.create({ user: userId, message, link });
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err.message);
  }
}

module.exports = { createNotification };
