const models = require("../models");
let CategoryRecipe = models.CategoryRecipe;
const _ = require('lodash');
const { Op } = require('sequelize');

async function create(categoryRecipe) {
    return CategoryRecipe.create(categoryRecipe);
}

async function removeCategoriesOfRecipe(recipeId) {
    return CategoryRecipe.destroy({
        where: {
            recipe_id: recipeId
        }
    })
}


module.exports = {
    create,
    removeCategoriesOfRecipe
};
