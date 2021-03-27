const models = require("../models");
let Collection = models.Collection;
let ShopingItem = models.ShopingItem;
let Recipe = models.Recipe;
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
                    model: models.ShopingItem,
                    as: 'shopingItems',
                    attributes: ["id"],
                    include: [
                        {
                            model: models.Recipe,
                            as: 'recipe',
                            include: [
                                {
                                    model: models.User,
                                    as: 'author'
                                }
                            ]
                        }
                    ]
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
      attributes: ['id', 'name'],
      include: [
        {
          model: models.CollectionItem,
          as: 'recipes',
          attributes: ['id', 'recipe_id'],
          include: [
            {
              model: models.Recipe,
              as: 'recipe'
            }
          ]
        }
      ]
    });
}

async function create(shopingList) {
    return ShopingList.create(shopingList, {
        include: [
            {
                model: models.ShopingItem,
                as: 'shopingItems'
            }
        ]
    });
}

async function update(id, shopingList) {
    return await ShopingList.update(shopingList, {
        where: {
            id: id,
        },
    });
}

async function removeRecipeFromShopingList({ recipe_id, user_id }) {
  console.log('-------- function remove -------------');
  try {
    const foundShopingList = await ShopingList.findOne({
      where: {
        user_id
      }
    })
    console.log('-------- shopiing list ------------', foundShopingList)
    if (!foundShopingList) {
      throw new Error('Not Found Shoping List')
    }

    const foundRecipe = await ShopingItem.findOne({ where : { recipe_id, shoping_list_id: foundShopingList.id }})
    if (foundRecipe) {
      console.log('-------- found recioe --------', foundRecipe)
      return ShopingItem.destroy({
        where: {
          shoping_list_id: foundRecipe.shoping_list_id,
          recipe_id
        }
      })
    } else {
      throw new Error('Recipe dose not exist in collection')
    }
  } catch (error) {
    //
  }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    removeRecipeFromShopingList
};
