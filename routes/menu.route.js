const router = require("express").Router();
const recipeRepo = require("../repository/recipe.repo");
const menuRepo = require("../repository/menu.repo");

const authorize = require('../middlewares/authorize');
const permitRole = require("../middlewares/permitRole");

router.get("/", authorize, async function (req, res) {
  const { startDate, endDate } = req.query;
  const { id: user_id } = req.user;
  const result = await menuRepo.getRecipesBetweenTwoDates(startDate, endDate, user_id);
  if (result) {
    res.status(200).json({
      result
    })
  }
});

router.post("/",authorize, permitRole('user'),async function (req, res) {
    try {
        const menu = req.body;
        Object.assign(menu, { user_id : req.user.id})
        const {user_id, recipe_id, date, session} = menu;
        const findDuplicate = await menuRepo.findRecipeInMenu(user_id, recipe_id, date, session);
        console.log('-------- find duplicate ----------', findDuplicate)
        if (findDuplicate) {
          return res.status(400).json({
            result: 0,
            message: 'Duplicate menu item'
          })
        }
        const createdMenu = await menuRepo.create(menu);
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