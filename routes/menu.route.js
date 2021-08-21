const router = require("express").Router();
const recipeRepo = require("../repository/recipe.repo");
const menuRepo = require("../repository/menu.repo");

const authorize = require('../middlewares/authorize');
const permitRole = require("../middlewares/permitRole");

const timeValue = {
  "morning": 1,
  "noon": 2,
  "night": 3
}

router.get("/", authorize, async function (req, res) {
  const { startDate, endDate } = req.query;
  const { id: user_id } = req.user;
  let result = await menuRepo.getRecipesBetweenTwoDates(startDate, endDate, user_id);
  result = result.map(item => item.toJSON())
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].timestamp === result[i+1].timestamp && timeValue[result[i].session] > timeValue[result[i+1].session]) {
      [result[i], result[i+1]] = [result[i+1], result[i]];
    }
  }
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].timestamp === result[i+1].timestamp && timeValue[result[i].session] > timeValue[result[i+1].session]) {
      [result[i], result[i+1]] = [result[i+1], result[i]];
    }
  }
  if (result) {
    res.status(200).json({
      result
    })
  }
});

router.post("/",authorize, permitRole('user'),async function (req, res) {
    try {
        const menu = req.body.menu.map((item) => {
          Object.assign(item, { user_id: req.user.id })
          return item
        });
        console.log({ menu})
        // Object.assign(menu, { user_id : req.user.id})
        // const {user_id, recipe_id, timestamp, session} = menu;
        // const findDuplicate = await menuRepo.findRecipeInMenu(user_id, recipe_id, timestamp, session);
        // if (findDuplicate) {
        //   return res.status(400).json({
        //     result: 0,
        //     message: 'Duplicate menu item'
        //   })
        // }
        // const createdMenu = await menuRepo.create(menu);
        const createdMenu = await menuRepo.bulkCreate(menu)
        if (createdMenu) {
          res.status(200).json({
            result: 1,
            menu: createdMenu
          });
        }
    } catch (error) {
        res.status(400).json({
            result: 0,
            message: error.message
        })
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
    const menuRecipe = await menuRepo.remove(req.params.id, req.user.id);
    return res.status(200).json({
      result: 1
    })
  } catch (error) {
    res.status(400).json({
      result: 0,
      message: error.message
    })
  }
})



module.exports = router;
