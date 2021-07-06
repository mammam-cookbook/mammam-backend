const models = require("../models");
let Category = models.Category;
const _ = require('lodash');
const { Op } = require('sequelize')
async function getAll() {
    return await Category.findAndCountAll({
        attributes: ['id', 'en', 'vi', 'parent_category_id']
    });
}

async function getById(id) {
    return await Category.findByPk(id);
}

async function create(category) {
    return Category.create(category);
}

async function update(id, category) {
    return await Category.update(category, {
        where: {
            id: id,
        },
    });
}

async function remove(id, user_id) {
    const category = await getById(id);
    if (!category) {
        throw new Error('Category not found!')
    } else {
        return await Category.destroy({
          where: {
            id: id,
          },
        });
    }
}

async function isCategoryExist(vnCategory, enCategory) {
    const category = await Category.findOne({
        where: {
            [Op.or]: [
                { 
                    vi: vnCategory 
                },
                { 
                    en: enCategory
                }
            ],  
        }
    })
    return category ? true : false;
}
module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    isCategoryExist
};
