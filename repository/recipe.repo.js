const models = require("../models");
let Recipe = models.Recipe;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const followRepo = require('../repository/follow.repo');
const { Op } = require('sequelize')
async function getAll(type, user_id) {
  console.log({ type, user_id })
  let where;
  let attributes;
  let order;
  if (type === 'recommend') {
    // 
  } else if (type === 'following') {
    const followings = await followRepo.getFollowings(user_id);
    const followingIds = followings.map(item => item.following_id);
    where = {
      user_id: {
        [Op.in]: followingIds
      }
    }
  } else if (type === 'highlights') {
    attributes = {
      include: [
        [
            models.sequelize.literal(`(
                SELECT COUNT(*)
                FROM reaction AS reactions
                WHERE reactions.recipe_id = "Recipe"."id"
            )`),
            'count'
        ]
      ]
    }
    order = [
      [models.sequelize.literal('count'), 'DESC']
    ]
  }
  return await Recipe.findAll({
    where,
    attributes,
    order,
    include: [
      {
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'avatar_url', 'email'],
        raw: true
      },
      {
        model: models.Comment,
        as: 'comments',
        raw: true,
        attributes: ['id', 'images', 'content', 'parent_comment_id', 'created_at', 'updated_at'],
        include: [
          {
            model: models.User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'email']
          }
        ]
      },
      {
        model: models.CategoryRecipe,
        as: 'categories',
        attributes: ['id'],
        include: [
          {
            model:  models.Category,
            as: 'category',
            attributes: ['id', 'en', 'vi']
          }
        ]
      },
      {
        model: models.Reaction,
        as: 'reactions',
        attributes: ['id', 'react'],
        include: [
          {
            model: models.User, 
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'email']
          }
        ]
      }
    ]
  });
}

async function filter({ search, limit = 10, offset = 0, categories, hashtag, ingredients, createdOrder, reactionOrder }) {
  let order = [];
  let extraWhereCondition = {};
  let categoriesCondition = {};
  let attributes = [];
  let having = {};
  let group = []

  // where condition
  if (hashtag) {
    return models.Recipe.findAndCountAll({
      where: {
        hashtags: { [Op.contains]: [hashtag] }
      }
    })
  }
  if (categories) {
    const inCategories = categories.map(item => `${item}`).toString();
    console.log({ inCategories });
    // attributes.push(
    //   [
    //     models.sequelize.literal(`(
    //       SELECT COUNT(*)
    //       FROM "categoryRecipe"
    //       WHERE "categoryRecipe"."recipe_id" = "Recipe"."id" AND "categoryRecipe"."id" IN ('c4da0a47-c873-4615-b19e-dbd6d0e0cd37','750e4846-8266-45cc-8ce9-684037d36889')
    //       GROUP BY "categoryRecipe"."recipe_id"
    //   )`),
    //   'matchCategoriesCount'
    //   ]
    // )
    attributes.push([models.sequelize.fn('count', models.sequelize.col('Recipe.id')), 'countCategory'])
    categoriesCondition = {
      category_id: {
        [Op.in] : categories
      } 
    }
    group.push('Recipe.id');
    group.push('author.id');
    group.push('categories.id')
    having = { }
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
          [Op.gte]: '0.3'
        }),
        {ingredients_name: { [Op.overlap]: [`%${search}%`] }}
      ]
    }
  }

  // order condition
  if (createdOrder) {
    order.push(['created_at', createdOrder])
  }
  if (reactionOrder) {
    attributes.push(
        [
            models.sequelize.literal(`(
                SELECT COUNT(*)
                FROM reaction AS reactions
                WHERE reactions.recipe_id = "Recipe"."id"
            )`),
            'count'
        ])
    order.push( [models.sequelize.literal('count'), reactionOrder])
  }

  // query 
  return models.Recipe.findAndCountAll({
    attributes: {
      include: attributes
    },
    include: [
      {
        model: models.User,
        as: 'author',
      },
      {
        model: models.CategoryRecipe,
        as: "categories",
        where: categoriesCondition,
        group
      }
    ],
    where: {
      ...extraWhereCondition
    },
    order,
    group
    // having: [{}, 'COUNT(?) >= ?', '`categories.category_id`', categories.length]
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
        attributes: ['id', 'name', 'avatar_url', 'email'],
        raw: true
      },
      {
        model: models.Comment,
        as: 'comments',
        raw: true,
        attributes: ['id', 'images', 'content', 'parent_comment_id', 'created_at', 'updated_at'],
        include: [
          {
            model: models.User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'email']
          }
        ]
      },
      {
        model: models.CategoryRecipe,
        as: 'categories',
        attributes: ['id'],
        include: [
          {
            model:  models.Category,
            as: 'category',
            attributes: ['id', 'en', 'vi']
          }
        ]
      },
      {
        model: models.Reaction,
        as: 'reactions',
        attributes: ['id', 'react'],
        include: [
          {
            model: models.User, 
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'email']
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
