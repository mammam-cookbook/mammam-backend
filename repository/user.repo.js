const models = require("../models");
let User = models.User;
let Reaction = models.Reaction;
let Recipe = models.Recipe;
let Follow = models.Follow;
const bcrypt = require("bcryptjs");

const { Op } = require('sequelize');

const sendNoti = require("../utils/sendNotification");

const dietRepo = require("../repository/dietUser.repo");
const allergyRepo = require("../repository/allergyUser.repo");

async function searchUsers({ limit = 10, offset = 0, keyword }) {
  return await User.findAndCountAll({
    where: {
      [Op.or]: [
        {
          name: { [Op.iLike]: `%${keyword}%` }
        },
        {
          email: { [Op.iLike]: `%${keyword}%` }
        }
      ]

    },
    limit,
    offset,
    attributes: { exclude: ["password"] },
  });
}

async function isEmailExist(email) {
  const count = await User.count({
    where: {
      email: email,
    },
  });
  return count !== 0;
}
async function getNameById(id) {
  return await User.findOne({
    where: {
      id: id,
    },
    attributes: ["name"]
  });
}

async function getEmailById(id) {
  return await User.findOne({
    where: {
      id: id,
    },
    attributes: ["email"]
  });
}

async function getById(id) {
  return await User.findOne({
    where: {
      id
    },
    include: [
      {
        model: models.Follow,
        as: 'follower',
        include: [
          {
            model: models.User,
            attributes: ['id', 'name', 'avatar_url', 'email'],
            as: 'user'
          }
        ]
      },
      {
        model: models.Follow,
        as: 'following',
        include: [
          {
            model: models.User,
            attributes: ['id', 'name', 'avatar_url', 'email'],
            as: 'following'
          }
        ]
      }
    ]
  });
}
async function getByEmail(email) {
  return await User.findOne({
    where: {
      email: email,
    },
  });
}
async function create(user) {
  user.password = bcrypt.hashSync(user.password, process.env.SALT || 10);
  return User.create(user);
}
async function update_password(email, password) {
  password = bcrypt.hashSync(password, process.env.SALT || 10);
  const isSuccess = await User.update({ password: password }, {
    where: {
      email: email
    }
  });
  return isSuccess !== 0;
}
async function update(id, user) {
  return await User.update(user, {
    where: {
      id: id,
    },
  });
}
async function update_ref_token(uid, refreshToken) {
  return await User.update(
    { ref_token: refreshToken },
    {
      where: {
        id: uid,
      },
    }
  );
}
async function remove(id) {
  return await User.destroy({
    where: {
      id: id,
    },
  });
}

const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash)

}

async function recipeDetail(id, recipe_id) {
  const reaction = await Reaction.findOne({
    where: {
      user_id: {
        [Op.eq]: id
      },
      recipe_id: {
        [Op.eq]: recipe_id
      }
    }
  });

  const author_id = await Recipe.findOne({
    where: {
      id: {
        [Op.eq]: recipe_id
      }
    },
    attributes: ['user_id']
  });

  const follow = await Follow.findOne({
    where: {
      user_id: {
        [Op.eq]: author_id.dataValues.user_id
      },
      following_id: {
        [Op.eq]: id
      }
    }
  });

  const result = { reaction, follow }; return result;

  //return reaction;
}

async function getAllUsers() {
  return await User.findAndCountAll({
    where: {
      role: {
        [Op.eq]: 'user'
      }
    },
    include: [
      {
        model: models.Follow,
        as: 'follower',
        include: [
          {
            model: models.User,
            as: 'user'
          }
        ]
      },
      {
        model: models.Follow,
        as: 'following',
        include: [
          {
            model: models.User,
            as: 'following'
          }
        ]
      }
    ]
  });
}

async function addPoint(pts, user_id) {
  var userPoint = await User.findOne({
    where: {
      id: user_id
    },
    attributes: ['point', 'rank']
  });

  if (userPoint.dataValues.point === null) {
    userPoint.dataValues.point = 0;
  }

  userPoint.dataValues.point += pts;

  if (userPoint.dataValues.point < 0) {
    userPoint.dataValues.point = 0;
  }

  //0-100-300-600-1000
  var rank;
  switch (true) {
    case (userPoint.dataValues.point >= 0 && userPoint.dataValues.point <= 100):
      rank = "bronze";
      break;
    case (userPoint.dataValues.point > 100 && userPoint.dataValues.point <= 300):
      rank = "silver"
      break;
    case (userPoint.dataValues.point > 300 && userPoint.dataValues.point <= 600):
      rank = "gold"
      break;
    case (userPoint.dataValues.point > 600):
      rank = "diamond"
      break;
  }

  if (rank === userPoint.dataValues.rank) {
    // do nothing cause rank doesn't change
  }
  else {
    const newRank = await User.update({ rank: rank }, {
      where: {
        id: user_id,
      }
    });
  }

  return await User.update({ point: userPoint.dataValues.point }, {
    where: {
      id: user_id,
    }
  });
}

async function banUser(user_id) {
  return await User.update({ status: 0 }, {
    where: {
      id: user_id,
    }
  });
}

async function unbanUser(user_id) {
  return await User.update({ status: 1 }, {
    where: {
      id: user_id,
    }
  });
}

async function checkIfBanned(user_id) {
  const status = await User.findOne({
    where: {
      id: user_id,
    },
    attributes: ["status"]
  });

  if (status.dataValues.status === 1) {
    return false;
  }
  else if (status.dataValues.status === 0) {
    return true;
  }
}

async function findFacebookUser(email) {
  return await User.findOne({
    where: {
      email: email,
      auth: 'Facebook'
    }
  });
}

async function findGoogleUser(email) {
  return await User.findOne({
    where: {
      email: email,
      auth: 'Google'
    }
  });
}

async function updateDeviceToken(token, user_id) {
  return await User.update({ device_token: token }, {
    where: {
      id: user_id,
    }
  });
}

async function removeDeviceToken(user_id) {
  return await User.update({ device_token: null }, {
    where: {
      id: user_id,
    }
  });
}

async function sendNotificationToAll(notification) {
  const tokens = await User.findAndCountAll({
    where: {
      device_token: {
        [Op.ne]: null
      }
    },
    attributes: ["device_token"]
  });

  if (tokens) {
    var token_list = [];
    for (var item of tokens.rows) {
      token_list.push(item.dataValues.device_token);
    }
    const message = {
      notification: notification,
      tokens: token_list
    };
    console.log(token_list);
    sendNoti.sendToMultiple(message);
    return true;
  }
  else {
    return false;
  }
}

async function editlevel(lv, userid) {
  return User.update({level: lv},{
    where: {
        id: userid,
    },
  }
  );
}

async function addDislikedIngredient(ingre, userid) {
  let all = await User.findOne({
    where:{
      id: userid,
    },
    attributes: ["disliked_ingredients"]
  });

  if(all.dataValues.disliked_ingredients === null)
  {
    all.dataValues.disliked_ingredients = ingre;
  }
  else {
    //ingre.forEach(element => all.dataValues.disliked_ingredients.push(element));
    for (var add of ingre) 
    {
      var validation = false;
      for (var alr of all.dataValues.disliked_ingredients) 
      {
        if (alr === add) //this ingredient already existed in user's disliked ingredients
        {
          validation = true; break;
        }
      }
      if (validation === false) 
      {
        all.dataValues.disliked_ingredients.push(add);
      }
    }
  }

  return User.update({disliked_ingredients: all.dataValues.disliked_ingredients},{
    where: {
        id: userid,
    },
  }
  );
}

async function getCustomization(user_id) {
  let result;

  let all = await User.findOne({
    where:{
      id: user_id,
    },
    attributes: ["disliked_ingredients"]
  });

  if (all.dataValues.disliked_ingredients !== null) 
  {
    if(all.dataValues.disliked_ingredients.length > 1)
    {
      let excludeIngredients = all.dataValues.disliked_ingredients;
      result = {...result, excludeIngredients};
    }
    else 
    {
      let excludeIngredients = all.dataValues.disliked_ingredients[0];
      result = {...result, excludeIngredients};
    }
  }

  let temp = [];

  let diet = await dietRepo.getFromUser(user_id); 
  for (var item of diet.rows)
  {
    temp.push(item.category_id);
  }
  let allergy = await allergyRepo.getFromUser(user_id); 
  for (var item of allergy.rows)
  {
    temp.push(item.category_id);
  }

  let categories;
  if (temp.length === 1) {
    categories = temp[0];
    result = {...result, categories};
  }
  else if (temp.length > 1) {
    categories = temp;
    result = {...result, categories};
  }

  return result;
}

async function checkIfFirstTimeLogin(user_id) {
  let login = await User.findOne({
    where:{
      id: user_id,
    },
    attributes: ["first_login"]
  });

  let bool = true;
  if(login.dataValues.first_login === null) {
    bool = true;
  }
  if(login.dataValues.first_login === false) {
    bool = false;
  }
  if(login.dataValues.first_login === true) {
    bool = true;
  }

  let result = {
    query: login,
    result: bool
  };

  return result;
}

async function changeFirstTimeLogin(user_id) {
  const result = await User.update({first_login: false},{
    where: {
        id: user_id,
    },
  }
  );
  return result;
}

async function getAllCustomization(user_id) {
  const lv = await User.findOne({
    where:{
      id: user_id,
    },
    attributes: ["level"]
  });
  
  let result;

  let level = lv.dataValues.level;
  result = {...result, level};

  let all = await User.findOne({
    where:{
      id: user_id,
    },
    attributes: ["disliked_ingredients"]
  });

  let disliked_ingredients = all.dataValues.disliked_ingredients;
  result = {...result, disliked_ingredients};

  let diet = await dietRepo.getFromUser(user_id); 
  let allergy = await allergyRepo.getFromUser(user_id); 
  let dietList = diet.rows;
  let allergyList = allergy.rows;
  result = {...result, dietList}; 
  result = {...result, allergyList}; 

  return result;
}

async function updateAllCustomization(user_id, customize) {
  const level = User.update({level: customize.level},{
    where: {
        id: user_id,
    },
  }
  );
  const disliked = User.update({disliked_ingredients: customize.disliked},{
    where: {
        id: user_id,
    },
  }
  );
  
  for (var item of customize.dietAdded) {
    const dietData = { user_id: user_id, category_id: item };
    try {
      const diet = await dietRepo.create(dietData);
      if (diet) {
        continue;
      }
    } catch(err) {
      throw new Error(err);
    }
  }

  for (var item of customize.dietRemoved) {
    const dietData = { user_id: user_id, category_id: item };
    try {
      const diet = await dietRepo.remove(dietData);
      if (diet === 1) {
        continue;
      }
    } catch(err) {
      throw new Error(err);
    }
  }

  for (var item of customize.allergyAdded) {
    const allergyData = { user_id: user_id, category_id: item };
    try {
      const allergy = await allergyRepo.create(allergyData);
      if (allergy) {
        continue;
      }
    } catch(err) {
      throw new Error(err);
    }
  }

  for (var item of customize.allergyRemoved) {
    const allergyData = { user_id: user_id, category_id: item };
    try {
      const allergy = await allergyRepo.remove(allergyData);
      if (allergy === 1) {
        continue;
      }
    } catch(err) {
      throw new Error(err);
    }
  }
  
  let result = {
    level: level,
    disliked_ingredients: disliked
  };
  return result;
}

module.exports = {
  update_password,
  isEmailExist,
  getNameById,
  searchUsers,
  getById,
  create,
  update,
  remove,
  update_ref_token,
  getByEmail,
  comparePassword,
  getAllUsers,
  recipeDetail,
  addPoint,
  banUser,
  unbanUser,
  checkIfBanned,
  getEmailById,
  findFacebookUser,
  findGoogleUser,
  updateDeviceToken,
  sendNotificationToAll,
  removeDeviceToken,
  editlevel,
  addDislikedIngredient,
  getCustomization,
  checkIfFirstTimeLogin,
  changeFirstTimeLogin,
  getAllCustomization,
  updateAllCustomization,
};
