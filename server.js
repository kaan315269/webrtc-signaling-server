// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
  }
});

const port = process.env.PORT || 3000;
const rooms = {};

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(userId);

    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('signal', (toId, signalData) => {
      io.to(roomId).emit('signal', { from: userId, to: toId, data: signalData });
    });

    socket.on('disconnect', () => {
      rooms[roomId] = rooms[roomId].filter(id => id !== userId);
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
