const socketIo = require('socket.io');

let io;
const userSockets = new Map(); // Map to store userId -> socketId

module.exports = {
  initSocket: (server) => {
    io = socketIo(server, {
      cors: {
        origin: '*', // Adjust for production
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      socket.on('register', (userId) => {
        if (userId) {
          userSockets.set(userId, socket.id);
          console.log(`User ${userId} registered with socket ${socket.id}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Remove from map on disconnect
        for (const [userId, socketId] of userSockets.entries()) {
          if (socketId === socket.id) {
            userSockets.delete(userId);
            break;
          }
        }
      });
    });
    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },

  getUserSocket: (userId) => {
    return userSockets.get(userId?.toString());
  },

  getActiveConnectionsCount: () => {
    // userSockets is a Map, but we also want to know total live socket connections
    // If we just want active socket instances (even if not registered user):
    if (!io) return 0;
    return io.engine.clientsCount;
  }
};
