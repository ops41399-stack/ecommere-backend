let io = null;

exports.initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: '*' }
  });
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('subscribe_product', (productId) => {
      socket.join(`product_${productId}`);
    });
    socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
  });
  return io;
};

exports.io = {
  emit: (...args) => {
    if (!io) return;
    return io.emit(...args);
  }
};
