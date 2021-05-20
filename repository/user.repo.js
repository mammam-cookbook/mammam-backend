const models = require("../models");
let User = models.User;
let Reaction = models.Reaction;
let Recipe = models.Recipe;
let Follow = models.Follow;
const bcrypt = require("bcryptjs");

const { Op } = require('sequelize');

async function getAll() {
  return await User.findAndCountAll({
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

module.exports = {
  update_password,
  isEmailExist,
  getNameById,
  getAll,
  getById,
  create,
  update,
  remove,
  update_ref_token,
  getByEmail,
  comparePassword,
  getAllUsers,
  recipeDetail,
};
