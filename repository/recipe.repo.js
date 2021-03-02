const models = require("../models");
let Recipe = models.Recipe;
const bcrypt = require("bcryptjs");

async function getAll() {
  return await Recipe.findAndCountAll({
  });
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
  remove
};
