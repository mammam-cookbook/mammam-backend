const models = require("../models");
let RecipeViews = models.RecipeViews;
let Recipe = models.Recipe;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');
const e = require("express");

async function countView(recipe_id) {
    // const recipe = await Recipe.findOne({ where: { id: recipe_id }});
    // if (!recipe) {
    //     throw Error('Recipe not found')
    // }

    // const recipeView = await RecipeViews.findOne({
    //     where: {
    //         recipe_id
    //     }
    // })
    // if (!recipeView) {
    //     return RecipeViews.create({ recipe_id, count: 1})
    // } else {
    //     const viewsOfRecipe = recipeView.count;
    //     return RecipeViews.update({ count: viewsOfRecipe + 1}, {
    //         where: {
    //             id: recipeView.id
    //         }
    //     })
    // } 
    const recipeView = await RecipeViews.create({ recipe_id, count: 1 })
    return recipeView;
}

async function getViewsOfRecipe(recipe_id) {
    const recipe = await Recipe.findOne({ where: { id: recipe_id }});
    if (!recipe) {
        throw Error('Recipe not found')
    }

    const recipeView = await RecipeViews.findOne({
        where: {
            recipe_id
        }
    }) 
    if (!recipeView) {
        return 0;
    }
    return recipeView.count;
}

module.exports = {
    countView,
    getViewsOfRecipe
};
