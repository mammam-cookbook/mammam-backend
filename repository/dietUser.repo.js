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

module.exports = {
    create,
    remove
};
