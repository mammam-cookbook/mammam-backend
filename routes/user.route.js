const router = require("express").Router();
const userRepo = require("../repository/user.repo");
const followRepo = require("../repository/follow.repo");
const { register_message } = require("../utils/mail.model");
const sendMail = require("../utils/mailer");
const { route } = require("./auth.route");
const { sendNotification } = require('../socketHandler/notification.handler')
const notificationRepo = require("../repository/notification.repo");

const cuisineRepo = require("../repository/cuisineUser.repo");
const dietRepo = require("../repository/dietUser.repo");
const authorize = require("../middlewares/authorize");

const recipeRepo = require("../repository/recipe.repo");
const authorize = require("../middlewares/authorize");
const getUserId = require("../middlewares/getUserId");

router.get('/', async (req, res) => {
  const {keyword, limit, offset} = req.query;
  try {
    const userlist = await userRepo.searchUsers({ limit, offset, keyword });
    return res.status(200).json({
      userlist
    })
  } catch (error) {
    throw new Error(error);
  }
})

router.post("/", async function (req, res) {
  const user = req.body;
  const findUser = await userRepo.getByEmail(user.email);
  if (findUser) {
    if (user){
      return res.status(400).json({
        message : "User exists!!"
      })
    }
  }
  const createdUser = await userRepo.create(user);
  if (createdUser) {
    sendMail(register_message(user.email))
    res.status(200).json({
      message: "Sign up success! Please signin"
    });
  }
});

router.get("/:id",async (req, res) => {
  const user = await userRepo.getById(req.params.id);
  if (!user) {
    return res.status(400).json({
      message: "User not found!"
    })
  }
  return res.status(200).json({
    user
  })
})

router.post("/:id/follow/:following_id", authorize, async (req, res) => {
  const { id, following_id} = req.params;
  const followData = { user_id: id, following_id};
  try {
    const follow = await followRepo.create(followData);
    const notification = {
      sender_id: id,
      receiver_id: following_id,
      type: 'follow'
    }
    const createdNotification = await notificationRepo.create(notification);
    const receiver = await userRepo.getById(following_id);
    const notificationData = {
      id: createdNotification.id,
      sender: req.user,
      receiver,
      type: "follow",
      createdAt: createdNotification.createdAt
    }
    console.log({ createdNotification, notificationData})
    sendNotification(req, notificationData);
    return res.status(200).json({
      follow
    })
  } catch (err) {
    throw new Error(err);
  }
})

router.get("/:id/follower", async(req, res) => {
  const {id} = req.params;
  try {
    const followers = await followRepo.getFollowers(id);
    return res.status(200).json({
      followers
    })
  } catch (error) {
    throw new Error(err);
  }
})

router.get("/:id/following", async(req, res) => {
  const {id} = req.params;
  try {
    const followings = await followRepo.getFollowings(id);
    return res.status(200).json({
      followings
    })
  } catch (error) {
    throw new Error(err);
  }
})

router.post("/:id/unfollow/:following_id", async (req, res) => {
  const { id, following_id} = req.params;
  const followData = { user_id: id, following_id};
  try {
    const follow = await followRepo.remove(followData);
    if (follow === 1){
      return res.status(200).json({
        result: 1
      })
    }
  } catch (err) {
    throw new Error(err);
  }
})

router.post("/cuisineuser/:category_id", authorize, async (req, res) => {
  const { category_id } = req.params;
  const cuisineData = { user_id: req.user.id, category_id };
  try {
    const cuisine = await cuisineRepo.create(cuisineData);
    if (cuisine[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.delete("/cuisineuser/:category_id", authorize, async (req, res) => {
  const { category_id } = req.params;
  const cuisineData = { user_id: req.user.id, category_id };
  try {
    const cuisine = await cuisineRepo.remove(cuisineData);
    if (cuisine === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.post("/dietuser/:category_id", authorize, async (req, res) => {
  const { category_id } = req.params;
  const dietData = { user_id: req.user.id, category_id };
  try {
    const diet = await dietRepo.create(dietData);
    if (diet[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.delete("/dietuser/:category_id", authorize, async (req, res) => {
  const { category_id } = req.params;
  const dietData = { user_id: req.user.id, category_id };
  try {
    const diet = await dietRepo.remove(dietData);
    if (diet === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.post("/userexperience", authorize, async (req, res) => {
  //const { id } = req.params;
  const level = req.body.level;
  try {
    //const result = await userRepo.editlevel(level, id);
    const result = await userRepo.editlevel(level, req.user.id);
    if(result[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.post("/userallergies", authorize, async (req, res) => {
  //const {id} = req.params;
  const allergies = req.body.allergies;
  try {
    //const result = await userRepo.addAllergies(allergies, id);
    const result = await userRepo.addAllergies(allergies, req.user.id);
    if(result[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.post("/userdislikedingredient", authorize, async (req, res) => {
  //const {id} = req.params;
  const disliked = req.body.disliked;
  try {
    //const result = await userRepo.addDislikedIngredient(disliked, id);
    const result = await userRepo.addDislikedIngredient(disliked, req.user.id);
    if(result[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.get("/:id/recipe", getUserId, async (req, res) => {
  const {id} = req.params;
  const isMine = id === req.userId;
  try {
    const recipes = await recipeRepo.getRecipeFromUser(id, isMine);
    return res.status(200).json({
      recipes
    })
  } catch (error) {
    throw new Error(error);
  }
})

router.put("/:id", authorize, async (req, res) => {
  const {id} = req.params;
  const user = req.body;
  try {
    const updatedUser = await userRepo.update(id, user);
    return res.status(200).json({
      updatedUser
    })
  } catch (error) {
    throw new Error(error);
  }
})

module.exports = router;
