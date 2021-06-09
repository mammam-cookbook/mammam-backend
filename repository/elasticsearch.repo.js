const esclient = require('../utils/elasticsearch');
const recipeRepo = require('./recipe.repo')
const userRepo = require('./user.repo')
const _ = require('lodash')
async function createIndex(index) { 
    try {
      await esclient.indices.create(index);
      console.log(`Created index ${index}`);
    } catch (err) {
      console.error(`An error occurred while creating the index ${index}:`);
      console.error(err);
    }
}

async function init() {
  try {
    esclient.indices.delete({
      index: 'recipes',
    }).then(function(resp) {
      console.log("Successful query!");
      console.log(JSON.stringify(resp, null, 4));
    }, function(err) {
      console.trace(err.message);
    });
    let recipeList = await recipeRepo.getAllForElasticSearch();
    const recipeIndex = {
        index: 'recipes',
        body: {
            mappings: {
                properties: {
                id: { type: 'text' },
                title: { type: 'text' },
                ration: { type: 'integer' },
                description: { type: 'text' },
                cooking_time: { type: 'integer'},
                avatar: { type: 'text'},
                status: { type: 'text'},
                user_id: { type: 'text'},
                steps: { type: 'nested'},
                ingredients: { type: 'nested'},
                ingredients_name: { type: 'nested'},
                hashtags: { type: 'nested'},
                createdAt: { type: 'date'},
                updatedAt: { type: 'date'},
                author: { type: 'nested'},
                categories: { type: 'nested'},
                reactions: { type: 'nested'},
                comments: { type: 'nested' },
                countReaction: { type: 'integer'}
            }
        }
      }
    }

    await createIndex(recipeIndex)
    recipeList = recipeList.map(recipe => recipe.dataValues)
    const body = recipeList.flatMap(doc => [{ index: { _index: 'recipes', _id: doc.id } }, {...doc, 
      categories: doc.categories.map(category => category.category_id),
      countReaction: doc.reactions.length
    }])
    if (recipeList.length > 0) {
      const { body: bulkResponse } = await esclient.bulk({ refresh: true, body })

      if (_.get(bulkResponse, 'errors')) {
        const erroredDocuments = []
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0]
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: body[i * 2],
              document: body[i * 2 + 1]
            })
          }
        })
        console.log(erroredDocuments)
      }
    
      const a = await esclient.count({ index: 'recipes' })
      console.log("Number of documents in dex:", a)
    } else {
      await esclient.indices.create(recipeIndex)
    }
  } catch (error) {
    console.log(`--------- init ------`, error.message)
  }
    
}

function checkConnection() {
    return new Promise(async (resolve) => {
      console.log("Checking connection to ElasticSearch...");
      let isConnected = false;
      while (!isConnected) {
        try {
          await esclient.cluster.health({});
          console.log("Successfully connected to ElasticSearch");
          isConnected = true;
        } catch (_) {
        }
      }
      resolve(true);
    });
}

async function deleteIndex(index) {
  try {
    if (!index) return false
    await esclient.indices.delete({
      index,
      ignoreUnavailable: true
    })

    return true
  } catch (e) {
    console.log(`delete ${index} index error`, e.message)
    return false
  }
}

async function deleteIndexDoc(index, id) {
  try {
    await esclient.delete({
      index,
      refresh: 'wait_for',
      id
    })
    return true
  } catch (e) {
    console.log(`delete ${index} index document id ${id}`, e.message)
    return false
  }
}

async function isElasticIndexExist(index) {
  return esclient.indices.exists({ index })
}

async function updateIndexDoc(index, id, doc) {
  try {

    const { body: isDocExist = false } = await esclient.exists({
      index,
      id
    })

    delete doc._id

    if (isDocExist) {
      await esclient.update({
        index,
        id,
        refresh: 'wait_for',
        body: {
          doc
        }
      })
    } else {
      await esclient.index({
        index,
        id,
        refresh: 'wait_for',
        body: doc
      })
    }
  } catch (e) {
    console.log(`update ${index} index document id ${id}`, e.message)
  }
}

module.exports = {
    createIndex,
    init,
    checkConnection,
    deleteIndexDoc,
    deleteIndex,
    isElasticIndexExist,
    updateIndexDoc
}