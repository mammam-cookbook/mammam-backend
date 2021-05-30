const router = require("express").Router();
const commentRepo = require("../repository/comment.repo");
const challengeRepo = require("../repository/challenge.repo");
const recipeRepo = require("../repository/recipe.repo");
const userRepo = require("../repository/user.repo");
const authorize = require('../middlewares/authorize');
const permitRole = require("../middlewares/permitRole");
const notificationRepo = require("../repository/notification.repo");
const _ = require('lodash')
const { sendNotification } = require("../socketHandler/notification.handler");

router.get("/", async function (req, res) {
  const result = await challengeRepo.query(req.query);
  if (result) {
    res.status(200).json({
      result
    })
  }
});

// user, admin, mod
router.post("/", authorize, permitRole('user'), async function (req, res) {
  try {
    const challenge = req.body;
    Object.assign(challenge, { user_id: req.user.id })

    if(challenge.images === null)
    {
      res.status(400).json({
        result: 0,
        message: 'Images is null'
      })
      return;
    }
    else
    {
      if(challenge.images.length === 0)
      {
        res.status(400).json({
          result: 0,
          message: 'Images have zero entries'
        })
        return;
      }
    }

    const createdChallenge = await challengeRepo.create(challenge);
    if (createdChallenge) {
      userRepo.addPoint(2, req.user.id);
      //let parentComment;
      const recipe = await recipeRepo.getById(challenge.recipe_id);
      userRepo.addPoint(10, recipe.user_id);
      //   if (comment.parent_comment_id) {
      //     parentComment = await commentRepo.getById(comment.parent_comment_id)
      //   }
      // create a notification
      // nếu ngườ comment là author, hoặc reply của comment chính mình thì không tạo notification
    //   if (req.user.id !== recipe.user_id /*&& req.user.id !== _.get(parentComment, 'user_id')*/) {
    //     const notification = {
    //       sender_id: req.user.id,
    //       type: 'comment',
    //       receiver_id: _.get(recipe, 'author.id'),
    //       recipe_id: challenge.recipe_id,
    //       comment_id: _.get(parentComment,'id')
    //     }
    //     const createdNotification = await notificationRepo.create(notification);
    //     const receiver = await userRepo.getById(notification.receiver_id);
    //     const notificationData = {
    //       id: createdNotification.id,
    //       sender: req.user,
    //       receiver,
    //       type: notification.type,
    //       createdAt: createdNotification.createdAt
    //     }
    //     sendNotification(req, notificationData)
    //   }
      // if (notification.type === "comment") {
      //   const notificationData = {
      //     id: createdNotification.id,
      //     recipe,
      //     sender: req.user,
      //     receiver: recipe.user,
      //     createdAt: createdNotification.createdAt
      //   };
      //   sendNotification(req, notificationData)
      // } else if (notification.type === "reply") {
      //   const notificationData = {
      //     id: createdNotification.id,
      //     recipe,
      //     sender: req.user,
      //     receiver: parentComment.user,
      //     createdAt: createdNotification.createdAt
      //   };
      //   sendNotification(req, notificationData)
      // }
      res.status(200).json({
        result: 1,
        challenge: createdChallenge
      });
    }
  } catch (error) {
    res.status(400).json({
      result: 0,
      message: error.message
    })
  }
});


router.delete("/:id", authorize, async (req, res) => {
  try {
    const challenge = await challengeRepo.remove(req.params.id, req.user.id);
    console.log(challenge);
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
