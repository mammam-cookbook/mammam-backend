const models = require("../models");
let Upvote = models.Upvote;
const recipeRepo = require('./recipe.repo');
const notificationRepo = require('./notification.repo');
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');
const { sendNotification } = require("../socketHandler/notification.handler");

async function getAll() {
    return await Upvote.findAndCountAll({

    });
}

async function create(upvote) {
    const [created_upvote, created] = await Upvote.findOrCreate({
        where: { user_id: upvote.user_id, comment_id : upvote.comment_id }
    });

    if(created) // user has yet to upvote this comment
    {
        return created_upvote;
    }
    else // user has not upvoted this comment
    {
        return await Upvote.destroy({
            where: {
                id: created_upvote.id,
            },
        });
    }
}

async function countUpvote(comment_id) {
    const upvote = await Upvote.findAndCountAll({
        where: {
            comment_id: comment_id
        }
    });
    return upvote.count;
}

async function checkIfUpvoted(user_id, comment_id) {
    const upvote = await Upvote.findOne({
        where: {
            user_id: user_id,
            comment_id: comment_id,
        }
    });
    
    return upvote ? true : false;
}

module.exports = {
    getAll,
    create,
    countUpvote,
    checkIfUpvoted,
};