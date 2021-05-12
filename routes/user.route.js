const router = require("express").Router();
const userRepo = require("../repository/user.repo");
const followRepo = require("../repository/follow.repo");
const { register_message } = require("../utils/mail.model");
const sendMail = require("../utils/mailer");
const { route } = require("./auth.route");
const notificationRepo = require("../repository/notification.repo");

const cuisineRepo = require("../repository/cuisineUser.repo");
const dietRepo = require("../repository/dietUser.repo");

router.get('/', (req, res) => {
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

router.post("/:id/follow/:following_id", async (req, res) => {
  const { id, following_id} = req.params;
  const followData = { user_id: id, following_id};
  try {
    const follow = await followRepo.create(followData);
    const notification = {
      sender_id: id,
      receiver_id: following_id,
      type: 'follow'
    }
    await notificationRepo.create(notification)
    return res.status(200).json({
      follow
    })
  } catch (err) {
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

router.post("/:id/addcuisineuser/:category_id", async (req, res) => {
  const { id, category_id } = req.params;
  const cuisineData = { user_id: id, category_id };
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

router.post("/:id/removecuisineuser/:category_id", async (req, res) => {
  const { id, category_id } = req.params;
  const cuisineData = { user_id: id, category_id };
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

router.post("/:id/adddietuser/:category_id", async (req, res) => {
  const { id, category_id } = req.params;
  const dietData = { user_id: id, category_id };
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

router.post("/:id/removedietuser/:category_id", async (req, res) => {
  const { id, category_id } = req.params;
  const dietData = { user_id: id, category_id };
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

router.post("/:id/userexperience", async (req, res) => {
  const { id } = req.params;
  const level = req.body.level;
  try {
    const result = await userRepo.editlevel(level, id);
    if(result[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.post("/:id/adduserallergies", async (req, res) => {
  const {id} = req.params;
  const allergies = req.body.allergies;
  try {
    const result = await userRepo.addAllergies(allergies, id);
    if(result[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

router.post("/:id/adduserdislikedingredient", async (req, res) => {
  const {id} = req.params;
  const disliked = req.body.disliked;
  try {
    const result = await userRepo.addDislikedIngredient(disliked, id);
    if(result[0] === 1) {
      return res.status(200).json({
        result: 1
      })
    }
  } catch(err) {
    throw new Error(err);
  }
})

module.exports = router;
