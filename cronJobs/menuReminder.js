var moment = require("moment");
const menu = require("../models/menu");
const menuRepo = require("../repository/menu.repo");
const recipeaRepo = require('../repository/recipe.repo')
const {sendToOne} = require('../utils/sendNotification')

async function pushNotification(menus) {
    await Promise.all(menus.map(async(menu) => {
        // socket 
        // firebase 
    }))
}

exports.remindRecipeInMenu = async () => {
    const date = new Date();
    const hours = (date.getHours() + 7) % 24;
    var unixTime = moment().utc().add(1, 'days').startOf('day').unix();
    let remindRecipes = [];
    if (hours > 20) {
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'morning')
        console.log({ remindRecipes })
    } else if (hours < 10) {
        unixTime = moment().utc().unix()
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'noon')
    } else {
        unixTime = moment().utc().unix()
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'night')
    }
}
