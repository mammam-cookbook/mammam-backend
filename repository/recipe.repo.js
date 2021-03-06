const models = require("../models");
let Recipe = models.Recipe;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize')
async function getAll() {
  return await Recipe.findAndCountAll({
  });
}

async function filter({ search, limit, categories, hashtag }) {
  console.log({categories})
  let extraWhereCondition = {};
  if (hashtag) {
    return models.Recipe.findAndCountAll({
      where: {
        hashtags: { [Op.contains]: [hashtag] }
      }
    })
  }
  if (categories)  {
    if (Array.isArray(categories)) {
      extraWhereCondition = {
        ...extraWhereCondition,
        categories: { [Op.overlap]: categories }
      }
    } else {
      extraWhereCondition = {
        ...extraWhereCondition,
        categories: { [Op.overlap]: [categories] }
      }
    }
  }
  if (search) {
    extraWhereCondition = {
      ...extraWhereCondition,
      [Op.or] : [
        { title: { [Op.iLike]: `%${search}%` }},
        { '$author.name$': { [Op.iLike]: `%${search}%` } },
        models.sequelize.where(
          models.sequelize.fn('similarity',
              models.sequelize.col("title"),
              `${search}`), {
                  [Op.gte]: '0.1'
              }),

      ]
    }
  }
  return models.Recipe.findAndCountAll({
    include: [
      {
        model: models.User,
        as: 'author'
      }
    ],
    where: {
      ...extraWhereCondition
    }
  })
}

async function getById(id) {
  return await Recipe.findByPk(id);
}

async function create(recipe) {
  return Recipe.create(recipe);
}

async function update(id, recipe) {
  return  await Recipe.update(recipe, {
    where: {
      id: id,
    },
  });
}

async function remove(id) {
  return await Recipe.destroy({
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
