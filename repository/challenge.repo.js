const models = require("../models");
let Challenge = models.Challenge;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');

async function getAll() {
    return await Challenge.findAndCountAll({
    });
}

async function query({ limit = 10, offset = 0, recipe_id }) {
    return models.Challenge.findAndCountAll({
        include: [
            {
                model: models.User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'email']
            }
        ],
        attributes: ['id','images','content'],
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
    return await Challenge.findOne({
        where: {
            id
        },
        include: [
            {
                model: models.User,
                attributes: ['id', 'name', 'avatar_url', 'email'],
                as: 'author'
            }
        ]
    });
}

async function create(challenge) {
    return Challenge.create(challenge);
}

async function update(id, challenge) {
    return await Challenge.update(challenge, {
        where: {
            id: id,
        },
    });
}

async function remove(id, user_id) {
    const challenge = await getById(id);
    if (!challenge) {
        throw new Error('Challenge not found!')
    } else {
      const author = challenge.user_id;
      if (author !== user_id) {
        throw new Error('User has no permission!')
      } else {
        return await Challenge.destroy({
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
    query
};
