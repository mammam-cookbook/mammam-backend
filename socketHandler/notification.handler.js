exports.sendCommenNotification = (req, notification) => {
    const io = req.app.get("socketio");
  
    if (req.user.id !== notification.sender.id) {
      io.sockets.in(req.body.authorId).emit("newNotification", {
        notification
      });
    }
};
  