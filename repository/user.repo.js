const models = require("../models");
let User = models.User;
let Reaction = models.Reaction;
let Recipe = models.Recipe;
let Follow = models.Follow;
const bcrypt = require("bcryptjs");

const { Op } = require('sequelize');

async function searchUsers({limit = 10, offset = 0, keyword}) {
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
async function getNameById(id){
  return await User.findOne({
    where:{
      id: id,
    },
    attributes: ["name"]
  });
}

async function getEmailById(id){
  return await User.findOne({
    where:{
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
async function update_password(email, password){
  password = bcrypt.hashSync(password, process.env.SALT || 10);
  const isSuccess = await User.update({password: password},{
    where:{
      email: email
    }
  });
  return isSuccess !== 0;
}
async function update(id, user) {
  return  await User.update(user, {
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

const comparePassword = (password, hash) =>{
  return bcrypt.compareSync(password,hash)
  
}

async function recipeDetail(id, recipe_id)
{
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

async function getAllUsers() 
{
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

async function addPoint(pts, user_id)
{
  var userPoint = await User.findOne({
    where: {
      id: user_id
    },
    attributes: ['point', 'rank']
  });

  if(userPoint.dataValues.point === null)
  {
    userPoint.dataValues.point = 0;
  }

  userPoint.dataValues.point += pts;

  if(userPoint.dataValues.point < 0)
  {
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
  
  if(rank === userPoint.dataValues.rank)
  {
    // do nothing cause rank doesn't change
  }
  else
  {
    const newRank = await User.update({rank: rank}, {
      where: {
          id: user_id,
      }
    });
  }

  return await User.update({point: userPoint.dataValues.point}, {
    where: {
        id: user_id,
    }
  });
}

async function banUser(user_id)
{
  return await User.update({status: 0}, {
    where: {
        id: user_id,
    }
  });
}

async function unbanUser(user_id)
{
  return await User.update({status: 1}, {
    where: {
        id: user_id,
    }
  });
}

async function checkIfBanned(user_id)
{
  const status = await User.findOne({
    where:{
      id: user_id,
    },
    attributes: ["status"]
  });

  if(status.dataValues.status === 1)
  {
    return false;
  }
  else if(status.dataValues.status === 0)
  {
    return true;
  }
}

async function findFacebookUser(email)
{
  return await User.findOne({
    where: {
      email: email,
      auth: 'Facebook'
    }
  });
}

async function findGoogleUser(email)
{
  return await User.findOne({
    where: {
      email: email,
      auth: 'Google'
    }
  });
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
  findGoogleUser
};
