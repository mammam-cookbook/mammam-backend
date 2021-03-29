const router = require("express").Router();
const recipeRepo = require("../repository/recipe.repo");
const _ = require('lodash')
const authorize = require('../middlewares/authorize');
const recipeViewsRepo = require("../repository/recipeViews.repo");
const categoryRecipeRepo = require("../repository/categoryRecipe.repo");

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
  const result = await recipeRepo.filter(req.query);
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

router.get("/:id",async (req, res) => {
  const { user } = req;
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
  const comments = convertCommentArrayToTreeArray(recipe.comments);
  return res.status(200).json({
    result: {...recipe.dataValues, comments, views: recipeViews}
  })
})

router.delete("/:id", authorize, async (req, res) => {
  try {
    const recipe = await recipeRepo.remove(req.params.id, req.user.id);
    console.log(recipe) 
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



module.exports = router;
