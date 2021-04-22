const models = require("../models");
let CuisineUser = models.CuisineUser;
const _ = require('lodash');
const { Op } = require('sequelize');

async function create(cuisineUser) {
    return CuisineUser.create(cuisineUser);
}

async function remove({id, user_id, category_id}) {
    let whereCondition;
    if (id) { 
      whereCondition = {...whereCondition, id}}
    if (user_id && category_id) {
      whereCondition = {...whereCondition, user_id, category_id }}
    console.log({ whereCondition })
    return CuisineUser.destroy({
      where: whereCondition
    })
}

module.exports = {
    create,
    remove
};
