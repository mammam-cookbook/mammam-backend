const models = require("../models");
let Recipe = models.Recipe;
let Menu = models.Menu;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');

async function getRecipesBetweenTwoDates(start, end, user_id) {
    console.log({ start, end})
    return Menu.findAll({
        where: {
            timestamp: {
                [Op.between]: [start, end]
            },
            user_id
        },
        include: [
          {
            model: models.Recipe,
            as: 'recipe',
            include: [
              {
                model: models.User,
                as: 'author',
                attributes: ['id', 'name', 'avatar_url', 'email'],
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
          },
          {
            model: models.User,
            as: 'user',
            attributes: ['id', 'name', 'avatar_url', 'email']
          }
        ]
    })
}

async function create(menu) {
  return Menu.create(menu);
}

async function update(id, menu) {
  return await Menu.update(menu, {
    where: {
      id: id,
    },
  });
}

async function getById(id) {
    return Menu.findOne({
        where: {
            id
        }
    })
}

async function findRecipeInMenu(user_id, recipe_id, timestamp, session) {
  return Menu.findOne({
    where: {
      user_id,
      recipe_id,
      timestamp,
      session
    }
  })
}

async function findRecipeInSession(timestamp, session) {
  return Menu.findAll({
    where: {
      timestamp,
      session
    }
  })
}

async function remove(id, user_id) {
  const menu = await getById(id);
  if (!menu) {
      throw new Error('Menu not found!')
  } else {
    const author = menu.user_id;
    if (author !== user_id) {
      throw new Error('User has no permission!')
    } else {
      return await Menu.destroy({
        where: {
          id: id,
        },
      });
    }
  }
}

module.exports = {
  getById,
  create,
  update,
  remove,
  getRecipesBetweenTwoDates,
  findRecipeInMenu,
  findRecipeInSession
};
