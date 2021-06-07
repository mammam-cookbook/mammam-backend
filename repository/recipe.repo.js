const models = require("../models");
let Recipe = models.Recipe;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const elasticClient = require("../utils/elasticsearch");
const followRepo = require('../repository/follow.repo');
const { Op } = require('sequelize');
const { isArray } = require("lodash");
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
        attributes: ['id', 'category_id'],
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

async function getAllForElasticSearch() {
  return await Recipe.findAll({
    include: [
      {
        model: models.User,
        as: 'author',
        attributes: ['id', 'name', 'avatar_url', 'email'],
        raw: true
      },
      {
        model: models.CategoryRecipe,
        as: 'categories',
        attributes: ['id', 'category_id'],
      },
      {
        model: models.Reaction,
        as: 'reactions',
        attributes: ['id', 'react']
      }
    ]
  });
}

async function filter({ search, limit = 10, offset = 0, categories, hashtag, ingredients, createdOrder, reactionOrder, excludeIngredients, fromCookingTime, toCookingTime }) {
  console.log({ excludeIngredients })
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
    if (typeof categories === "string") categories = [categories]
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
    // attributes.push([models.sequelize.fn('count', models.sequelize.col('Recipe.id')), 'countCategory'])
    categoriesCondition = {
      category_id: {
        [Op.in] : categories
      } 
    }
    // group.push('Recipe.id');
    // group.push('author.id');
    // group.push('categories.id')
    // having = { }
  }

  if (fromCookingTime && toCookingTime) {
    extraWhereCondition = {
      ...extraWhereCondition,
      cooking_time: { 
        [Op.between]: [fromCookingTime, toCookingTime] 
      }
    }
  }

  if (excludeIngredients) {
    if (Array.isArray(excludeIngredients)) {
      extraWhereCondition ={
        ...extraWhereCondition,
        [Op.not]: [
          {
          ingredients_name: { [Op.overlap]: [excludeIngredients] }
          }
        ] 
      }
    } else {
      extraWhereCondition = {
        ...extraWhereCondition,
        [Op.not]: [
          {
          ingredients_name: { [Op.overlap]: [excludeIngredients] }
          }
        ] 
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
        // group
      }
    ],
    where: {
      ...extraWhereCondition
    },
    order,
    // group
    // having: [{}, 'COUNT(?) >= ?', '`categories.category_id`', categories.length]
  })
}

async function search({ search, categories, limit = 10, offset = 0, hashtag, ingredients, createdOrder, reactionOrder, excludeIngredients, fromCookingTime, toCookingTime}) {
  let mustQuery = [];
  let filter = [];
  let sortField = [];
  let mustNotQuery = [];
  let shouldQuery= [];
  if (excludeIngredients) {
    excludeIngredients = isArray(excludeIngredients) ? excludeIngredients : [excludeIngredients]
    if (excludeIngredients.length > 1) {
      mustNotQuery.push({
        terms: {
          "ingredients_name.keyword": excludeIngredients 
        }
      })
    } else {
      mustNotQuery.push({
        term: {
          "ingredients_name.keyword": excludeIngredients[0]
        }
      })
    }
  }  
  if (search) {
    mustQuery.push({
      multi_match: {
        query: search,
        fields: [ "title", "description", "steps.content", "author.name"]
      }
    })
  }
  if (categories) {
    categories = isArray(categories) ? categories : [categories]
    if (categories.length > 1) {
      filter.push({
        terms: {
          "categories.keyword": categories 
        }
      })
    } else {
      filter.push({
        term: {
          "categories.keyword": categories[0]
        }
      })
    }
  }
  if (createdOrder) {
    sortField.push({
      "createdAt": { "order" : createdOrder}
    })
  }
  if (reactionOrder) {
    sortField.push({
      "countReaction": { "order": reactionOrder}
    })
  }
  if (toCookingTime && fromCookingTime) {
    mustQuery.push({
      "range": {
        "cooking_time" : { 
          "gte" : fromCookingTime,
          "lte" : toCookingTime,
          "boost" : 2.0
         }
      }
    })
  }
  console.log({ shouldQuery: JSON.stringify(shouldQuery) })
  console.log({ body: JSON.stringify({
    sort: sortField,
    query: {
      bool: {
        must: mustQuery,
        filter,
        must_not: mustNotQuery
      },
    }
  })})
  const body = await elasticClient.search({
    index: 'recipes',
    from: offset,
    size: limit,
    body: {
      sort: sortField,
      query: {
        bool: {
          must: mustQuery,
          filter,
          must_not: mustNotQuery
        },
      }
    }
  })
  console.log({ body: body.hits })
  return {
    result: body.hits.hits,
    total: body.hits.total.value
  }
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
        model: models.CategoryRecipe,
        as: 'categories',
        attributes: ['id', 'category_id'],
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

async function getRecipeFromUser(user_id)
{
  return await Recipe.findAll({ 
    where: {
      user_id: {
        [Op.eq]: user_id
      }
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

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  filter,
  getRecipeFromUser,
  search,
  getAllForElasticSearch
};
