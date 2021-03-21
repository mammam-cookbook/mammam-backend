const router = require("express").Router();
const authorize = require('../middlewares/authorize');

router.get("/",authorize, async function (req, res) {
    const { user } = req;
});

module.exports = router;
