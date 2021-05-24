const router = require("express").Router();
const reactionRepo = require("../repository/reaction.repo");
const authorize = require('../middlewares/authorize');

router.post("/",authorize, async function (req, res) {
    const reaction = req.body;
    Object.assign(reaction, { user_id : req.user.id, user: req.user })
    const createdReaction = await reactionRepo.create(req, reaction);
    if (createdReaction) {
      res.status(200).json({
        result: 1,
        reaction: createdReaction
      });
    }
});

module.exports = router;