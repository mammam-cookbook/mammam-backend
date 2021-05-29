const router = require("express").Router();
const upvoteRepo = require("../repository/upvote.repo");
const authorize = require('../middlewares/authorize');

router.post("/", authorize, async function (req, res) {
    const upvote = req.body; 
    Object.assign(upvote, { user_id : req.user.id, user: req.user })
    const createdUpvote = await upvoteRepo.create(upvote); 
    if (createdUpvote) {
      res.status(200).json({
        result: 1,
        upvote: createdUpvote
      });
    }
});

module.exports = router;