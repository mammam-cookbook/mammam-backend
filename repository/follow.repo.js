const models = require("../models");
let Follow = models.Follow;

async function create(follow) {
  return Follow.create(follow);
}

async function remove({id, user_id, following_id}) {
  let whereCondition;
  if (id) { 
    console.log("====== CO ID ----------", id);
    whereCondition = {...whereCondition, id}}
  if (user_id && following_id) {
    console.log("======== khong co id --------------");
    whereCondition = {...whereCondition, user_id, following_id }}
  console.log({ whereCondition })
  return Follow.destroy({
    where: whereCondition
  })
}

module.exports = {
  create,
  remove
};
