var moment = require("moment");
const menu = require("../models/menu");
const menuRepo = require("../repository/menu.repo");
const userRepo = require("../repository/user.repo")
const recipeRepo = require('../repository/recipe.repo')
const notificationRepo = require('../repository/notification.repo')
const {sendToOne} = require('../utils/sendNotification');
const { sendNotification, remindNotification } = require("../socketHandler/notification.handler");

async function pushNotification(menus) {
    await Promise.all(menus.map(async(menu) => {
        const recipe = await recipeRepo.getById(menu.recipe_id)
        const user = await userRepo.getById(menu.user_id)
        const admin = await userRepo.getByEmail('admin@admin.com')
        const notification = {
            sender_id: admin.id,
            type: 'remind',
            receiver_id: menu.user_id,
            recipe_id: menu.recipe_id
        }
        const createdNotification = await notificationRepo.create(notification)
        const notificationData = {
            id: createdNotification.id,
            sender: admin,
            receiver: user,
            type: notification.type,
            recipe: recipe,
            createdAt: createdNotification.createdAt
          }
        remindNotification(notificationData)
        if (user.device_token) {
            return sendToOne({
                notification: {
                    title: "Meal Plan Reminder",
                    body: recipe.title
                },
                token: user.device_token
            })
        }
        return null
    }))
}

exports.remindRecipeInMenu = async () => {
    const date = new Date();
    const hours = (date.getHours() + 7) % 24;
    var unixTime = moment().utc().add(1, 'days').startOf('day').unix();
    let remindRecipes = [];
    if (hours > 20) {
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'morning')
    } else if (hours < 10) {
        unixTime = moment().utc().unix()
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'noon')
    } else {
        unixTime = moment().utc().unix()
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'night')
    }
    pushNotification(remindRecipes)
}
