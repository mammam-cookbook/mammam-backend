const models = require("../models");
let Notification = models.Notification;

async function create(notification) {
  return Notification.create(notification);
}

async function update(id, notification) {
  return await Notification.update(notification, {
    where: {
      id: id,
    },
  });
}

async function listNotifications({user_id, limit = 10, offset = 0 }) {
  return Notification.findAndCountAll({
    where: {
      receiver_id: user_id
    },
    order: [
      ["created_at", "DESC"]
    ],
    include: [
        {
            model: models.User,
            as: 'sender',
            attributes: ['id', 'name', 'avatar_url', 'email']
        },
        {
            model: models.User,
            as: 'receiver',
            attributes: ['id', 'name', 'avatar_url', 'email']
        },        {
            model: models.Comment,
            as: 'comment',
            attributes: ['id', 'recipe_id', 'content']
        },        {
            model: models.Recipe,
            as: 'recipe',
            attributes: ['id', 'title', 'avatar']
        }
    ],
    limit,
    offset
  })
}


module.exports = {
  create,
  update,
  listNotifications
};
