const models = require("../models");
let Recipe = models.Recipe;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const elasticClient = require("../utils/elasticsearch");
const followRepo = require('../repository/follow.repo');
const { Op } = require('sequelize');
const { isArray } = require("lodash");
const userRepo = require("../repository/user.repo");

async function getAll(type, user_id, offset, limit) {
  console.log({ type, user_id, offset, limit })
  let where;
  let attributes;
  let order;
  let excludeIngredients;
  if (type === 'recommend') {
    let finalQuery = {};

    if (user_id !== null) {
      finalQuery = await userRepo.getCustomization(user_id); 
    }

    let reactionOrder = 'desc';
    
    if (finalQuery.excludeIngredients) {
      if (Array.isArray(finalQuery.excludeIngredients)) {
        excludeIngredients = finalQuery.excludeIngredients.map(ingredient => ingredient.toLowerCase())
      }
      else 
      {
        excludeIngredients = finalQuery.excludeIngredients.toLowerCase();
      }
    }
    finalQuery = {...finalQuery, excludeIngredients, reactionOrder, offset, limit }
    console.log(finalQuery);
    
    const data = await RecommendSearch(finalQuery);
    const result = data.result.map(item => item._source);
    return result;
  } else if (type === 'following') {
    const followings = await followRepo.getFollowings(user_id);
    const followingIds = followings.map(item => item.following_id);
    where = {
      status: 'Approved',
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
    where = {
      status: 'Approved',
    }
  }
  return await Recipe.findAll({
    where,
    attributes,
    order,
    offset,
    limit,
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
      },
      {
        model: models.Challenge,
        as: 'challenges',
        attributes: ['id', 'images', 'content'],
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
    where: {
      status: 'Approved'
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
        attributes: ['id', 'name', 'avatar_url', 'email'],
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

async function RecommendSearch({ categories, limit = 10, offset = 0, ingredients, createdOrder, reactionOrder, excludeIngredients}) {
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
  if (ingredients) {
    ingredients = isArray(ingredients) ? ingredients : [ingredients]
    if (ingredients.length > 1) {
      shouldQuery.push({
        terms: {
          "ingredients_name.keyword": ingredients
        }
      })
    } else {
      shouldQuery.push({
        term: {
          "ingredients_name.keyword": ingredients[0]
        }
      })
    }
  }
  if (categories) {
    categories = isArray(categories) ? categories : [categories]
    if (categories.length > 1) {
      shouldQuery.push({
        terms: {
          "categories.keyword": categories 
        }
      })
    } else {
      shouldQuery.push({
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
          must_not: mustNotQuery,
          should: shouldQuery
        },
      }
    }
  })
  return {
    result: body.hits.hits,
    total: body.hits.total.value
  }
}

async function search({ search, categories, limit = 10, offset = 0, hashtag, ingredients, createdOrder, reactionOrder, excludeIngredients, fromCookingTime, toCookingTime}) {
  let mustQuery = [];
  let filter = [];
  let sortField = [];
  let mustNotQuery = [];
  let shouldQuery= [];
  if (ingredients) {
    ingredients = isArray(ingredients) ? ingredients : [ingredients]
    ingredients = ingredients.map(ingredient => ingredient.toLowerCase())
    if (ingredients.length > 1) {
      ingredients.forEach(ingredient => {
        mustQuery.push({
          term: {
            "ingredients_name.keyword": ingredient
          }
        })
      })
    } else {
      mustQuery.push({
        term: {
          "ingredients_name.keyword": ingredients[0]
        }
      })
    }
  }
  if (excludeIngredients) {
    excludeIngredients = isArray(excludeIngredients) ? excludeIngredients : [excludeIngredients]
    excludeIngredients = excludeIngredients.map(ingredient => ingredient.toLowerCase())
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
        attributes: ['id', 'name', 'avatar_url', 'email', 'role'],
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
        include: [
          {
            model: models.User,
            as: 'author',
            attributes: ['id', 'name', 'avatar_url', 'email']
          }
        ]
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
        model: models.Challenge,
        as: 'challenges',
        attributes: ['id', 'images', 'content', 'created_at', 'updated_at'],
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
    if (false) {
      throw new Error('User has no permission!')
    } else {
      let destroyed = await Recipe.destroy({
        where: {
          id: id,
        },
      });
      let result = {
        result: destroyed,
        recipe: recipe
      }
      return result;
    }
  }
}

async function getRecipeFromUser(user_id, isMine)
{
  const extraWhere = !isMine ? { status: 'Approved' } : {};
  return await Recipe.findAll({ 
    where: {
      ...extraWhere,
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
      },
      {
        model: models.Challenge,
        as: 'challenges',
        attributes: ['id', 'images', 'content'],
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
  getAllForElasticSearch,
  RecommendSearch
};
