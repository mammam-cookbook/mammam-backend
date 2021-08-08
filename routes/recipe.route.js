const router = require("express").Router();
const recipeRepo = require("../repository/recipe.repo");
const reactionRepo = require("../repository/reaction.repo");
const followRepo = require("../repository/follow.repo");
const upvoteRepo = require("../repository/upvote.repo");
const commentRepo = require("../repository/comment.repo");
const _ = require('lodash')
const authorize = require('../middlewares/authorize');
const recipeViewsRepo = require("../repository/recipeViews.repo");
const categoryRecipeRepo = require("../repository/categoryRecipe.repo");
const getUserId = require("../middlewares/getUserId");
const elasticRepo = require("../repository/elasticsearch.repo");

const convertCommentArrayToTreeArray = (arr) => {
  const hashObj = {};
  arr.forEach((item) => {
    hashObj[item.id] = item;
    item.dataValues.childrenComments = [];
  });

  const result = [];
  arr.forEach((item) => {
    if (item.dataValues.parent_comment_id !== null) {
      hashObj[item.parent_comment_id].dataValues.childrenComments.push(item);
    } else {
      result.push(item);
    }
  });

  return result;
};

router.get("/", async function (req, res) {
  const result = await recipeRepo.search(req.query);
  console.log({ result })
  if (result) {
    res.status(200).json({
      ...result
    })
  }
});

router.get("/rec", async function (req, res) {
  console.log(req.query);
  const result = await recipeRepo.RecommendSearch(req.query);
  console.log({ result })
  if (result) {
    res.status(200).json({
      ...result
    })
  }
});

router.get("/list",getUserId, async function (req, res) {
  const result = await recipeRepo.getAll(req.query.type, req.userId);
  if (result) {
    res.status(200).json({
      result
    })
  }
});

router.post("/",authorize, async function (req, res) {
  const recipe = req.body;
  const { categories } = recipe;
  console.log({ categories })
  Object.assign(recipe, { user_id : req.user.id})
  const createdRecipe = await recipeRepo.create(recipe);
  if (createdRecipe) {
    try {
      await Promise.all( await categories.map(category => categoryRecipeRepo.create({ recipe_id: createdRecipe.id, category_id: category })));
      await elasticRepo.updateIndexDoc('recipes', createdRecipe.id, 
      {
        ...createdRecipe.dataValues,
        countReaction: 0,
        categories,
        author: { 
          id: req.user.id,
          name: req.user.name,
          avatar_url: req.user.avatar_url,
          email: req.user.email
        } 
      })
      res.status(200).json({
        result: 1,
        recipe: createdRecipe
      });
    } catch (error) {
      res.status(400).json({
        result: 0,
        message: error.message
      })
    }
  }
});

router.post("/draft",authorize, async function (req, res) {
  const recipe = req.body;
  const { categories } = recipe;
  Object.assign(recipe, { user_id : req.user.id, status: 'Pending' })
  const createdRecipe = await recipeRepo.create(recipe);
  if (createdRecipe) {
    try {
      if (categories && categories.length > 0) {
        await Promise.all( await categories.map(category => categoryRecipeRepo.create({ recipe_id: createdRecipe.id, category_id: category })));
      }
      res.status(200).json({
        result: 1,
        recipe: createdRecipe
      });
    } catch (error) {
      res.status(400).json({
        result: 0,
        message: error.message
      })
    }
  }
});


router.get("/:id", getUserId, async (req, res) => {
  const { userId, user } = req;
  const recipe = await recipeRepo.getById(req.params.id);
  if (!recipe) {
    return res.status(400).json({
      message: "Recipe not found!"
    })
  }

  if (_.get(user, 'id') !== recipe.user_id && (_.get(user, 'role') !== 'admin')) {
    recipeViewsRepo.countView(recipe.id)
  }

  const recipeViews = await recipeViewsRepo.getViewsOfRecipe(recipe.id);
  // check if user reacted to or followed the author
  const isReaction = await reactionRepo.checkReaction(userId, recipe.id);
  const isFollow = await followRepo.checkFollow(userId, recipe.dataValues.user_id);
  // add upvote information to comments
  for (var item of recipe.comments) {
    const upvoteCount = await upvoteRepo.countUpvote(item.id);
    const isUpvoted = await upvoteRepo.checkIfUpvoted(userId, item.id);
    item.dataValues = {
      ...item.dataValues,
      upvoteCount: upvoteCount,
      isUpvoted: isUpvoted
    }
  }
  const comments = convertCommentArrayToTreeArray(recipe.comments);
  return res.status(200).json({
    result: {...recipe.dataValues, comments, views: recipeViews, isReaction, isFollow}
  })
})

router.get("/:id/comment", getUserId, async (req, res) => {
  const { userId, user } = req;
  let comments = await commentRepo.getCommentFromRecipe(req.params.id);
  if (!comments) {
    return res.status(400).json({
      message: "Query went wrong!"
    })
  }
  for (var item of comments.rows) {
    const upvoteCount = await upvoteRepo.countUpvote(item.id);
    const isUpvoted = await upvoteRepo.checkIfUpvoted(userId, item.id);
    item.dataValues = {
      ...item.dataValues,
      upvoteCount: upvoteCount,
      isUpvoted: isUpvoted
    }
  }
  comments.rows = convertCommentArrayToTreeArray(comments.rows);
  // if(req.query.type === 'upvote') {
  //   for (let i = 0; i < comments.rows.length; i++)
  //   {
  //     for (let j = i + 1; j < comments.rows.length; j++)
  //     {
  //       if (comments.rows[i].dataValues.upvoteCount > comments.rows[j].dataValues.upvoteCount) 
  //       {
  //         let temp = comments.rows[i];
  //         comments.rows[i] = comments.rows[j];
  //         comments.rows[j] = temp;
  //       }
  //     }
  //   }
  // }
  recursiveSort(comments.rows, req.query.type);
  return res.status(200).json({
    comments
  })
})

function recursiveSort(commentArray, type)
{
  sortComments(commentArray, type);
  for (let i = 0; i < commentArray.length; i++) 
  {
    if (commentArray[i].dataValues.childrenComments.length > 1)
    {
      recursiveSort(commentArray[i].dataValues.childrenComments, type);
    }
  }
}

function sortComments(comments, type)
{
  for (let i = 0; i < comments.length; i++)
  {
    for (let j = i + 1; j < comments.length; j++)
    {
      if (type === 'upvote') {
        if (comments[i].dataValues.upvoteCount > comments[j].dataValues.upvoteCount) 
        {
          let temp = comments[i];
          comments[i] = comments[j];
          comments[j] = temp;
        }
      }
      else if (type === 'chrono') {
        if (comments[i].dataValues.createdAt > comments[j].dataValues.createdAt) 
        {
          let temp = comments[i];
          comments[i] = comments[j];
          comments[j] = temp;
        }
      }
    }
  }
}

router.delete("/:id", authorize, async (req, res) => {
  try {
    const recipe = await recipeRepo.remove(req.params.id, req.user.id);
    console.log(recipe.recipe.dataValues.id) 
    await elasticRepo.deleteIndexDoc('recipes', recipe.recipe.dataValues.id);
    return res.status(200).json({
      result: 1
    })
  } catch (error) {
    console.log('----- error ------', error)
    res.status(400).json({
      result: 0,
      message: error.message
    })
  }
})

router.put("/:id", authorize, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    Object.assign(data, { status: 'Pending' });
    const result = await recipeRepo.update(id, data);
    await categoryRecipeRepo.removeCategoriesOfRecipe(id);
    await Promise.all(data.categories.map(category => categoryRecipeRepo.create({ recipe_id: id, category_id: category })))
    const updatedRecipe = await recipeRepo.getById(id);
    if (result) {
      await elasticRepo.updateIndexDoc('recipes', updatedRecipe.id, {
        ...updatedRecipe.dataValues,
        countReaction: updatedRecipe.reactions.length,
        categories: data.categories,
        author: { 
          id: req.user.id,
          name: req.user.name,
          avatar_url: req.user.avatar_url,
          email: req.user.email
        } 
      })
      return res.status(200).json({
        result: 1
      })
    }
  } catch (error) {
    res.status(400).json({
      result: 0,
      message: error.message
    })
  }
})

module.exports = router;
