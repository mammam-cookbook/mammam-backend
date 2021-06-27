const app = require('../server')
exports.sendNotification = (req, notification) => {
    const io = req.app.get("socketio");
    console.log({ io, receiver: notification.receiver.id, sender: notification.sender.id })
    //if (req.user.id !== notification.sender.id) {
      console.log({ sockets: io.sockets, user: io.user })
      io.sockets.in(notification.receiver.id).emit("newNotification", {
        notification
      });
    //}
};

exports.remindNotification = (notification) => {
  const io = app.get("socket.io")
  io.sockets.in(notification.receiver.id).emit("newNotification", {
    notification
  });
}