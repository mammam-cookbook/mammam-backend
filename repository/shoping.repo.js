const models = require("../models");
let ShopingList = models.ShopingList;

async function getAll({ user_id }) {
  let where;
    if (user_id) {
      where = { user_id }
    }
    return await ShopingList.findAll(
        { 
            where,
            attributes: ["id"],
            include: [
              {
                model: models.User,
                as: 'user',
                attributes: ['id', 'name', 'avatar_url', 'email']
              },
              {
                model: models.Recipe,
                as: 'recipe'
              }
            ]
        }
    );
}

async function getById(id) {
    return await ShopingList.findOne({
      where: {
        id
      },
      attributes: ['id', 'user_id', 'recipe_id'],
      include: [
        {
          model: models.User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url', 'email']
        },
        {
          model: models.Recipe,
          as: 'recipe'
        }
      ]
    });
}

async function findShopingItem({ user_id, recipe_id }) {
  return await ShopingList.findOne({
    where: {
      user_id,
      recipe_id
    },
    include: [
      {
        model: models.User,
        as: 'user',
        attributes: ['id', 'name', 'avatar_url', 'email']
      },
      {
        model: models.Recipe,
        as: 'recipe'
      }
    ]
  });
}

async function create(shopingList) {
    return ShopingList.create(shopingList);
}

async function update(id, shopingList) {
    return await ShopingList.update(shopingList, {
        where: {
            id: id,
        },
    });
}

async function removeRecipeFromShopingList({ recipe_id, user_id }) {
  try {
    const foundShopingList = await ShopingList.findOne({
      where: {
        user_id,
        recipe_id
      }
    })
    if (!foundShopingList) {
      throw new Error('Not Found Shoping List')
    }
      return ShopingList.destroy({
        where: {
          user_id,
          recipe_id
        }
      })
  } catch (error) {
    //
  }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    removeRecipeFromShopingList,
    findShopingItem
};
