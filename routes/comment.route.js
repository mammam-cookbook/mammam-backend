const router = require("express").Router();
const commentRepo = require("../repository/comment.repo");
const authorize = require('../middlewares/authorize');

router.get("/", async function (req, res) {
  const result = await commentRepo.query(req.query);
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


router.delete("/:id",authorize, async (req, res) => {
  try {
    const comment = await commentRepo.remove(req.params.id, req.user.id);
    console.log(comment) 
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
