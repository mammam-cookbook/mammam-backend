const models = require("../models");
let Recipe = models.Recipe;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize')
async function getAll(type) {
  const user_id = req.user.id;
  let where;
  if (type === 'recommend') {
    // 
  } else if (type === 'following') {
    where = {
      include: [
        {
          model: models.User,
          as: 'author',
          include: [
            {
              model: models.Follow,
              as: 'follower',
              where: {
                user_id
              }
            }
          ]
        }
      ]
    }
  } else if (type === 'highlights') {
    // 
  }
  return await Recipe.findAndCountAll({
    where
  });
}

async function filter({ search, limit = 10, offset = 0, categories, hashtag, ingredients, createdOrder }) {
  let order = [];
  let extraWhereCondition = {};

  // where condition
  if (hashtag) {
    return models.Recipe.findAndCountAll({
      where: {
        hashtags: { [Op.contains]: [hashtag] }
      }
    })
  }
  if (categories) {
    if (Array.isArray(categories)) {
      extraWhereCondition = {
        ...extraWhereCondition,
        categories: { [Op.contains]: categories }
      }
    } else {
      extraWhereCondition = {
        ...extraWhereCondition,
        categories: { [Op.contains]: [categories] }
      }
    }
  }

  if (ingredients) {
    if (Array.isArray(ingredients)) {
      extraWhereCondition = {
        ...extraWhereCondition,
        ingredients_name: { [Op.overlap]: ingredients }
      }
    } else {
      extraWhereCondition = {
        ...extraWhereCondition,
        ingredients_name: { [Op.overlap]: [ingredients] }
      }
    }
  }

  if (search) {
    extraWhereCondition = {
      ...extraWhereCondition,
      [Op.or]: [
        { title: { [Op.iLike]: `%${search}%` } },
        models.sequelize.where(
          models.sequelize.fn('similarity',
            models.sequelize.col("title"),
            `${search}`), {
          [Op.gte]: '0.1'
        }),
        models.sequelize.where(
          models.sequelize.fn('similarity',
            models.sequelize.col("author.name"),
            `${search}`), {
          [Op.gte]: '0.1'
        }),
      ]
    }
  }

  // order condition
  if (createdOrder) {
    order.push(['created_at', createdOrder])
  }

  // query
  return models.Recipe.findAndCountAll({
    include: [
      {
        model: models.User,
        as: 'author'
      }
    ],
    where: {
      ...extraWhereCondition
    },
    order,
    limit,
    offset
  })
}

async function getById(id) {
  return await Recipe.findOne({
    where: {
      id
    },
    include: [
      {
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'avatar_url', 'email']
      },
      {
        model: models.Comment,
        as: 'comments',
        attributes: ['id', 'images', 'content'],
        include: [
          {
            model: models.User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'email']
          },
          {
            model: models.Comment,
            as: 'parentComment',
            attributes: ['id', 'images', 'content'],
            include: [
              {
                model: models.User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'email']
              },
            ]
          }
        ]
      }
    ]
  });
}

async function create(recipe) {
  return Recipe.create(recipe);
}

async function update(id, recipe) {
  return await Recipe.update(recipe, {
    where: {
      id: id,
    },
  });
}

async function remove(id, user_id) {
  const recipe = await getById(id);
  if (!recipe) {
      throw new Error('Recipe not found!')
  } else {
    const author = recipe.user_id;
    if (author !== user_id) {
      throw new Error('User has no permission!')
    } else {
      return await Recipe.destroy({
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
  filter
};
