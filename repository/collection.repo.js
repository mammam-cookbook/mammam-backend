const models = require("../models");
let Collection = models.Collection;
let CollectionItem = models.CollectionItem;
let Recipe = models.Recipe;

async function getAll({ user_id }) {
  let where;
    if (user_id) {
      where = { user_id }
    }
    return await Collection.findAll({ where });
}

async function getById(id) {
    return await Collection.findOne({
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

async function create(collection) {
    return Collection.create(collection);
}

async function update(id, collection) {
    return await Collection.update(collection, {
        where: {
            id: id,
        },
    });
}

async function remove(id, user_id) {
    const collection = await getById(id);
    if (!collection) {
        throw new Error('Collection not found!')
    } else {
        return await Collection.destroy({
          where: {
            id: id,
          },
        });
    }
}

async function addRecipeToCollection({ recipe_id, collection_id}) {
  const recipe = await Recipe.findOne({ where: { id: recipe_id }});
  const collection = await Collection.findOne({ where: { id: collection_id }});
  if (!recipe) {
    throw new Error('Recipe not found')
  }

  if (!collection) {
    throw new Error('Collection not found')
  }

  const collectionItem = await CollectionItem.findOne({ where : { recipe_id, collection_id}})
  console.log('------ collection iutem ---------', collectionItem)
  if (collectionItem) {
    throw new Error('Recipe already exist in collection')
  }
  return CollectionItem.create({ recipe_id, collection_id });
}

async function removeRecipeFromCollection({ recipe_id, collection_id}) {
  try {
    const foundRecipe = await CollectionItem.findOne({
      where: {
        recipe_id,
        collection_id
      }
    })
    if (!foundRecipe) {
      throw new Error('Not Found Collection Item')
    }

    const collectionItem = await CollectionItem.findOne({ where : { recipe_id, collection_id}})
    if (collectionItem) {
      return CollectionItem.destroy({
        where: {
          collection_id,
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
    remove,
    addRecipeToCollection,
    removeRecipeFromCollection
};
