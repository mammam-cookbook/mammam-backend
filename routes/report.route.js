const router = require("express").Router();
const problemRepo = require("../repository/problem.repo");
const reportProblemRepo = require("../repository/reportProblem.repo");
const reportRepo = require("../repository/report.repo");
const { route } = require("./auth.route");
const permitRole = require("../middlewares/permitRole");
const authorize = require("../middlewares/authorize");
const _ = require('lodash');

router.post("/", authorize, async function (req, res) {
    const report = req.body;
    Object.assign(report, { user_id : req.user.id });
    const createdReport = await reportRepo.create(report);
    if (createdReport) {
      for (var item of req.body.problem) {
        console.log(item);
        const problem = await problemRepo.getByKey(item);
        console.log(problem);
        if (problem) {
          var createReportProblem = {
            report_id: createdReport.id,
            problem_id: problem.dataValues.id
          };
          const createdReportProblem = await reportProblemRepo.create(createReportProblem); 
        }
      }
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