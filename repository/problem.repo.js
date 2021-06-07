const models = require("../models");
let Problem = models.Problem;
const _ = require('lodash');

async function getAll() {
    return await Problem.findAndCountAll({
    });
}

async function getById(id) {
    return await Problem.findOne({
        where: {
            id
        },
    });
}

async function create(problem) {
    return Problem.create(problem);
}

async function update(id, problem) {
    return await Problem.update(problem, {
        where: {
            id: id,
        },
    });
}

async function remove(id) {
    const problem = await getById(id);
    if (!problem) {
        throw new Error('Problem not found!')
    } else {
        return await Problem.destroy({
            where: {
                id: id,
            },
        });
    }
}

async function getByKey(key) {
    return await Problem.findOne({
        where: {
            key
        },
    });
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    getByKey
};
