const Notification = require('../models/Notification');
const { getIO, getUserSocket } = require('./socket');

/**
 * Creates a notification in DB and emits it real-time to the specific user via Socket.io
 */
const sendNotification = async ({ userId, role, title, message, type = 'system', link = '' }) => {
  try {
    // Save to database
    const notification = await Notification.create({
      userId,
      role,
      title,
      message,
      type,
      link
    });

    // Emit to socket if user is online
    try {
      const io = getIO();
      const socketId = getUserSocket(userId);
      if (socketId) {
        io.to(socketId).emit('newNotification', notification);
      }
    } catch (socketErr) {
      console.error('Socket error while sending notification:', socketErr);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = {
  sendNotification
};
