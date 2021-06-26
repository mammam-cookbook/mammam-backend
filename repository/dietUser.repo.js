const models = require("../models");
let DietUser = models.DietUser;
const _ = require('lodash');
const { Op } = require('sequelize');

async function create(dietUser) {
    return DietUser.create(dietUser);
}

async function remove({id, user_id, category_id}) {
    let whereCondition;
    if (id) { 
      whereCondition = {...whereCondition, id}}
    if (user_id && category_id) {
      whereCondition = {...whereCondition, user_id, category_id }}
    console.log({ whereCondition })
    return DietUser.destroy({
      where: whereCondition
    })
}

async function getFromUser(user_id) {
  return await DietUser.findAndCountAll({
    where: {
      user_id: user_id
    }
  })
}

module.exports = {
    create,
    remove,
    getFromUser
};