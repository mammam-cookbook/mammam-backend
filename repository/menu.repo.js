const models = require("../models");
let Recipe = models.Recipe;
let Menu = models.Menu;
const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');

async function getRecipesBetweenTwoDates(start, end, user_id) {
    return Menu.findAll({
        where: {
            date: {
                [Op.and]: {
                    $gte: start,
                    $lte: end
                }
            },
            user_id
        }
    })
}

async function create(menu) {
  const { user_id } = menu;
  if (user_id !== req.user.id) {
    throw new Error('User has no permission!')
  }
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
  getRecipesBetweenTwoDates
};
