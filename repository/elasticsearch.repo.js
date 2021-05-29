const esclient = require('../utils/elasticsearch');
const recipeRepo = require('./recipe.repo')
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
    esclient.deleteByQuery({
        index: 'recipes',            
        body: {
            query: {
                match_all: {}
            }
        }
    }, function (error, response) {
        console.log(response);
    });
    const recipeList = await recipeRepo.getAll();
    const recipeIndex = {
        index: 'recipes',
        body: {
            mappings: {
                properties: {
                id: { type: 'string' },
                title: { type: 'string' },
                ration: { type: 'Numbers' },
                description: { type: 'text' },
                cooking_time: { type: 'Numbers'},
                avatar: { type: 'string'},
                status: { type: 'string'},
                level: { type: 'string'},
                user_id: { type: 'string'},
                steps: { type: 'nested'},
                ingredients: { type: 'nested'},
                ingredients_name: { type: 'nested'},
                hashtags: { type: 'nested'},
                createdAt: { type: 'date'},
                updatedAt: { type: 'date'},
                author: { type: 'object'},
                comments: { type: ' nested'},
                categories: { type: 'nested'},
                reactions: { type: 'nested'}
            }
        }
        }
    }

    await createIndex(recipeIndex)
    const body = recipeList.flatMap(doc => [{ index: { _index: 'recipes' } }, doc])
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
  
    const { body: count } = await esclient.count({ index: 'recipes' })
    console.log(count)
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

module.exports = {
    createIndex,
    init,
    checkConnection
}