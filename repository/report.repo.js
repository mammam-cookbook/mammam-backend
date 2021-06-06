const models = require("../models");
let Report = models.Report;
const _ = require('lodash');

async function getAll() {
    return await Report.findAndCountAll({
        include: [
            {
                model: models.Recipe,
                as: 'recipe'
            }
        ]
    });
}

async function getById(id) {
    return await Report.findOne({
        where: {
            id
        },
    });
}

async function create(report) {
    return Report.create(report);
}

async function update(id, report) {
    return await Report.update(report, {
        where: {
            id: id,
        },
    });
}

async function remove(id) {
    const report = await getById(id);
    if (!report) {
        throw new Error('Report not found!')
    } else {
        return await Report.destroy({
            where: {
                id: id,
            },
        });
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
};
