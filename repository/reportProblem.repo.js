const models = require("../models");
let ReportProblem = models.ReportProblem;
const _ = require('lodash');

async function create(reportProblem) {
    return ReportProblem.create(reportProblem);
}

module.exports = {
    create,
};