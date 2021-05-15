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
       as: 'following'
     } 
    ]
  })
}

async function getFollowers(userId) {
  return Follow.findAll({
    where: {
      following_id: userId
    },
    include: [
      {
        model: models.User,
        as: 'user'
      } 
     ]
  })
}
module.exports = {
  create,
  remove,
  getFollowers,
  getFollowings
};
