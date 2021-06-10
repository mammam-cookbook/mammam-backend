const models = require("../models");
let Comment = models.Comment;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize')
async function getAll() {
    return await Comment.findAndCountAll({
    });
}

async function query({ limit = 10, offset = 0, recipe_id }) {
    // query
    return models.Comment.findAndCountAll({
        include: [
            {
                model: models.User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'email']
            },
            {
                model: models.Comment,
                as: 'parentComment',
                attributes: ['id','images','content'],
                include: [
                    {
                        model: models.User,
                        as: 'author',
                        attributes: ['id', 'name', 'avatar_url', 'email']
                    },
                ]
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
    return await Comment.findOne({
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

async function create(comment) {
    return Comment.create(comment);
}

async function update(id, comment) {
    return await Comment.update(comment, {
        where: {
            id: id,
        },
    });
}

async function remove(id, user_id) {
    const comment = await getById(id);
    if (!comment) {
        throw new Error('Recipe not found!')
    } else {
      const author = comment.user_id;
      if (author !== user_id) {
        throw new Error('User has no permission!')
      } else {
        return await Comment.destroy({
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
