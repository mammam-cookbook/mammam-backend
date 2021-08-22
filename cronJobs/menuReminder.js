var moment = require("moment");
const menu = require("../models/menu");
const menuRepo = require("../repository/menu.repo");
const userRepo = require("../repository/user.repo")
const recipeRepo = require('../repository/recipe.repo')
const notificationRepo = require('../repository/notification.repo')
const {sendToOne} = require('../utils/sendNotification');
const { sendNotification, remindNotification } = require("../socketHandler/notification.handler");

async function pushNotification(menus, time) {
    let timeTitle;
    if (time === "morning") {
        timeTitle = 'sáng mai'
    } else if (time === "noon") {
        timeTitle = "trưa nay"
    } else {
        timeTitle = "tối nay"
    }
    await Promise.all(menus.map(async(menu) => {
        const [recipe, user, admin] = await Promise.all([
            recipeRepo.getById(menu.recipe_id),
            userRepo.getById(menu.user_id),
            userRepo.getByEmail('admin@admin.com')
        ])
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
            time,
            createdAt: createdNotification.createdAt
          }
        remindNotification(notificationData)
        if (user.device_token) {
            return sendToOne({
                notification: {
                    title: 'Hôm nay ăn gì',
                    body: `Thực đơn ${timeTitle} có ${recipe.title}`
                },
                data : {
                  recipeId: recipe.id
                },
                android: {
                    notification: {
                      imageUrl: recipe.avatar[0]
                    }
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
    let time;
    let remindRecipes = [];
    if (hours > 20) {
        time = 'morning'
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'morning')
    } else if (hours < 11) {
        time = 'noon'
        unixTime = moment().utc().startOf('days').unix()
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'noon')
    } else {
        time = 'night'
        unixTime = moment().utc().startOf('days').unix()
        remindRecipes = await menuRepo.findRecipeInSession(unixTime, 'night')
    }
    pushNotification(remindRecipes, time)
}
