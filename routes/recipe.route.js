const router = require("express").Router();
const recipeRepo = require("../repository/recipe.repo");
const authorize = require('../middlewares/authorize');

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
  Object.assign(recipe, { user_id : req.user.id})
  const createdRecipe = await recipeRepo.create(recipe);
  if (createdRecipe) {
    res.status(200).json({
      result: 1,
      recipe: createdRecipe
    });
  }
});


router.get("/:id",async (req, res) => {
  const recipe = await recipeRepo.getById(req.params.id);
  if (!recipe) {
    return res.status(400).json({
      message: "Recipe not found!"
    })
  }   
  return res.status(200).json({
    recipe
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
