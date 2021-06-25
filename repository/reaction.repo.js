const models = require("../models");
let Reaction = models.Reaction;
const recipeRepo = require('./recipe.repo');
const notificationRepo = require('./notification.repo');
const _ = require('lodash');
const elasticRepo = require('../repository/elasticsearch.repo')
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');
const { sendNotification } = require("../socketHandler/notification.handler");
async function getAll() {
    return await Reaction.findAndCountAll({
    });
}

async function query({ limit = 10, offset = 0, recipe_id }) {
    // query
    return models.Reaction.findAndCountAll({
        include: [
            {
                model: models.User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'email']
            },
        ],
        attributes: ['id', 'react'],
        where: {
            recipe_id
        },
        order: [
            ['created_at', 'ASC']
        ],
        limit,
        offset
    })
}

async function getById(id) {
    return await Reaction.findByPk(id);
}

async function create(req, reaction) {
    //return Reaction.create(reaction);
    const [created_react, created] = await Reaction.findOrCreate({
        where: { user_id: reaction.user_id, recipe_id : reaction.recipe_id },
        defaults: {
            react: reaction.react
        }
    });

    let recipe = await recipeRepo.getById(reaction.recipe_id);
    recipe = recipe.dataValues;
    if (created) { //user has yet to react to this recipe
        const notification = {
            sender_id: reaction.user_id,
            receiver_id: recipe.user_id,
            type: 'like',
            recipe_id: recipe.id
        }
        const createdNotification = await notificationRepo.create(notification);
        const notificationData = {
            id: createdNotification.id,
            sender: reaction.user,
            receiver: recipe.author,
            recipe,
            createdAt: createdNotification.createdAt
        }
        console.log({ createdNotification, notificationData})
        sendNotification(req, notificationData);
        console.log({ body: {...recipe, countReaction: recipe.reactions.length}})
        await elasticRepo.updateIndexDoc('recipes', recipe.id, {...recipe, 
            countReaction: recipe.reactions.length,
            categories: recipe.categories.map(category => category.category_id)
        })
        return created_react;
    }
    else //user has reacted to this recipe
    {
        if(created_react.react === reaction.react) //this reaction exists, get rid of it
        {
            await elasticRepo.updateIndexDoc('recipes', recipe.id, {...recipe, 
                countReaction: recipe.reactions.length -1,
                categories: recipe.categories.map(category => category.category_id)})
            return await Reaction.destroy({
                where: {
                    id: created_react.id,
                },
            });
        }
        else //this reaction doesnt exist, update it
        {
            await elasticRepo.updateIndexDoc('recipes', recipe.id, {...recipe, 
                countReaction: recipe.reactions.length,
                categories: recipe.categories.map(category => category.category_id)
            })
            return Reaction.update({react: reaction.react},{
                where: {
                    id: created_react.id,
                },
            }
            );
        }
    }
}

async function update(id, reaction) {
    return await Reaction.update(reaction, {
        where: {
            id: id,
        },
    });
}

async function checkReaction(user_id, recipe_id) {
    const reaction = await Reaction.findOne({
        where: {
          user_id,
          recipe_id
        }
    });

    return reaction ? true : false;
}


async function remove(id, user_id) {
    const reaction = await getById(id); 
    if (!reaction) {
        throw new Error('Reaction not found!')
    } else {
      const author = reaction.dataValues.user_id;
      if (author !== user_id) {
        throw new Error('User has no permission!')
      } else {
        return await Reaction.destroy({
          where: {
            id: id,
          },
        });
      }
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    query,
    checkReaction
};