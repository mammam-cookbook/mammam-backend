const models = require("../models");
let Reaction = models.Reaction;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize')
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

async function create(reaction) {
    //return Reaction.create(reaction);
    const [created_react, created] = await Reaction.findOrCreate({
        where: { user_id: reaction.user_id, recipe_id : reaction.recipe_id },
        defaults: {
            react: reaction.react
        }
    });
    if (created) { //user has yet to react to this recipe
        return created_react;
    }
    else //user has reacted to this recipe
    {
        if(created_react.react === reaction.react) //this reaction exists, get rid of it
        {
            return await Reaction.destroy({
                where: {
                    id: created_react.id,
                },
            });
        }
        else //this reaction doesnt exist, update it
        {
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

async function checkReaction(id, recipe_id) {
    const reaction = await Reaction.findOne({
        where: {
          user_id: {
            [Op.eq]: id
          },
          recipe_id: {
            [Op.eq]: recipe_id
          }
        }
    });

    return reaction;
}


async function remove(id, user_id) {
    // const reaction = await getById(id);
    // if (!reaction) {
    //     throw new Error('Reaction not found!')
    // } else {
    //   const author = reaction.user_id;
    //   if (author !== user_id) {
    //     throw new Error('User has no permission!')
    //   } else {
    //     return await Reaction.destroy({
    //       where: {
    //         id: id,
    //       },
    //     });
    //   }
    // }
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