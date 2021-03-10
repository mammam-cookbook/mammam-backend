const router = require("express").Router();
const commentRepo = require("../repository/comment.repo");
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
  const comment = req.body;
  Object.assign(comment, { user_id : req.user.id})
  const createdComment = await commentRepo.create(comment);
  if (createdComment) {
    res.status(200).json({
      result: 1,
      comment: createdComment
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


module.exports = router;
