const models = require("../models");
let Follow = models.Follow;

async function create(follow) {
  return Follow.create(follow);
}

async function remove({id, user_id, following_id}) {
  let whereCondition;
  if (id) { 
    whereCondition = {...whereCondition, id}}
  if (user_id && following_id) {
    whereCondition = {...whereCondition, user_id, following_id }}
  console.log({ whereCondition })
  return Follow.destroy({
    where: whereCondition
  })
}

async function getFollowings(userId) {
  return Follow.findAll({
    where: {
      user_id: userId
    },
    include: [
     {
       model: models.User,
       attributes: ['id', 'name', 'avatar_url', 'email'],
       as: 'following'
     } 
    ]
  })
}

async function checkFollow(user_id, following_id) {
  const follow = await Follow.findOne({
    where: {
      user_id,
      following_id
    },
  });

  return follow ? true : false;
}

async function getFollowers(userId) {
  return Follow.findAll({
    where: {
      following_id: userId
    },
    include: [
      {
        model: models.User,
        attributes: ['id', 'name', 'avatar_url', 'email'],
        as: 'user'
      } 
     ]
  })
}
module.exports = {
  create,
  remove,
  getFollowers,
  getFollowings,
  checkFollow
};
