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

async function filter({ search, limit = 10, offset = 0, categories, hashtag, ingredients, createdOrder }) {
  let order = [];
  let extraWhereCondition = {};
  let categoriesCondition = {};

  // where condition
  if (hashtag) {
    return models.Recipe.findAndCountAll({
      where: {
        hashtags: { [Op.contains]: [hashtag] }
      }
    })
  }
  console.log({ categories })
  if (categories) {
    categoriesCondition = {
      category_id: {
        [Op.in] : categories
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

  // query 
  return models.Recipe.findAndCountAll({
    include: [
      {
        model: models.User,
        as: 'author',
      },
      // {
      //   model: models.CategoryRecipe,
      //   as: "categories",
      //   where: categoriesCondition,
      //   attributes: {
      //     include: [[models.sequelize.fn('COUNT', models.sequelize.col('categories.category_id')), 'numCategories']]
      //   },
      //   group: ['Recipe.id'],
      //   include: [
      //     {
      //       model: models.Category,
      //       as: 'category'
      //     }
      //   ]
      // }
    ],
    where: {
      ...extraWhereCondition
    },
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
