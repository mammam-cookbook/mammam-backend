const models = require("../models");
let Comment = models.Comment;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize')
async function getAll() {
    return await Comment.findAndCountAll({
    });
}

async function filter({ limit = 10, offset = 0, recipeId }) {
    // query
    return models.Comment.findAndCountAll({
        include: [
            {
                model: models.Recipe,
                as: 'recipe'
            },
            {
                model: models.User,
                as: 'author'
            }
        ],
        where: {
            recipe_id: recipeId
        },
        order: [
            ['created_at', 'ASC']
        ],
        limit,
        offset
    })
}

async function getById(id) {
    return await Comment.findByPk(id);
}

async function create(Comment) {
    return Comment.create(Comment);
}

async function update(id, Comment) {
    return await Comment.update(Comment, {
        where: {
            id: id,
        },
    });
}

async function remove(id) {
    return await Comment.destroy({
        where: {
            id: id,
        },
    });
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    filter
};
