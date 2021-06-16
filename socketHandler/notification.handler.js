exports.sendNotification = (req, notification) => {
    const io = req.app.get("socketio");
    console.log({ io, receiver: notification.receiver, sender: notification.sender })
    if (req.user.id !== notification.sender.id) {
      io.sockets.in(notification.receiver.id).emit("newNotification", {
        notification
      });
    }
};
  