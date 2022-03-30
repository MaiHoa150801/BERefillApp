const socketIO = require('socket.io');

exports.sio = (server) => {
  return socketIO(server, {
    transports: ['polling'],
    cors: {
      origin: '*',
    },
  });
};

exports.connection = (io) => {
  io.on('connection', (socket) => {
    socket.on('data', (data) => {
      console.log(data);
    });

    socket.on('disconnect', () => {});
  });
};
