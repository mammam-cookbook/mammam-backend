const router = require("express").Router();
//const problemRepo = require("../repository/problem.repo");
const reportRepo = require("../repository/report.repo");
const { route } = require("./auth.route");
const permitRole = require("../middlewares/permitRole");
const authorize = require("../middlewares/authorize");
const _ = require('lodash');

router.post("/", authorize, async function (req, res) {
    const report = req.body;
    const createdReport = await reportRepo.create(report);
    if (createdReport) {
      res.status(200).json({
        result: 1,
        report: createdReport
      });
    }
});

router.get("/", authorize, permitRole('admin'), async function (req, res) {
    const Report = await reportRepo.getAll();
    if (Report) {
      res.status(200).json({
        result: 1,
        report: Report
      });
    }
});

module.exports = router;