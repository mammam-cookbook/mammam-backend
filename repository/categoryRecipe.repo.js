const models = require("../models");
let CategoryRecipe = models.CategoryRecipe;
const _ = require('lodash');
const { Op } = require('sequelize');

async function create(categoryRecipe) {
    return CategoryRecipe.create(categoryRecipe);
}


module.exports = {
    create
};
