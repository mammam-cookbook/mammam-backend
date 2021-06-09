const router = require("express").Router();
const problemRepo = require("../repository/problem.repo");
const { route } = require("./auth.route");
const permitRole = require("../middlewares/permitRole");
const authorize = require("../middlewares/authorize");
const _ = require('lodash');

router.post("/", authorize, permitRole('admin'), async function (req, res) {
    const problem = req.body;
    const createdProblem = await problemRepo.create(problem);
    if (createdProblem) {
      res.status(200).json({
        result: 1,
        problem: createdProblem
      });
    }
});

router.get("/", async function (req, res) {
    const Problem = await problemRepo.getAll();
    if (Problem) {
      res.status(200).json({
        result: 1,
        problem: Problem
      });
    }
});

router.delete("/", authorize, permitRole('admin'), async function (req, res) {
    const problem = req.body.id;
    const deletedProblem = await problemRepo.remove(problem);
    if (deletedProblem) {
      res.status(200).json({
        result: 1,
        deleted: deletedProblem
      });
    }
});

module.exports = router;