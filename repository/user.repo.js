const models = require("../models");
let User = models.User;
const bcrypt = require("bcryptjs");

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
};
