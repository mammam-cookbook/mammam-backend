const app = require('../server')
exports.sendNotification = (req, notification) => {
    const io = req.app.get("socketio");
    console.log({ io, receiver: notification.receiver, sender: notification.sender })
    if (req.user.id !== notification.sender.id) {
      io.sockets.in(notification.receiver.id).emit("newNotification", {
        notification
      });
    }
};

exports.remindNotification = (notification) => {
  const io = app.get("socket.io")
  io.sockets.in(notification.receiver.id).emit("newNotification", {
    notification
  });
}