const models = require("../models");
let AllergyUser = models.AllergyUser;
const _ = require('lodash');
const { Op } = require('sequelize');

async function create(allergyUser) {
    return AllergyUser.create(allergyUser);
}

async function remove({id, user_id, category_id}) {
    let whereCondition;
    if (id) { 
      whereCondition = {...whereCondition, id}}
    if (user_id && category_id) {
      whereCondition = {...whereCondition, user_id, category_id }}
    console.log({ whereCondition })
    return AllergyUser.destroy({
      where: whereCondition
    })
}

async function getFromUser(user_id) {
  return await AllergyUser.findAndCountAll({
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