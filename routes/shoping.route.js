const router = require("express").Router();
const shopingRepo = require("../repository/shoping.repo");
const collectionRepo = require("../repository/collection.repo");
const authorize = require('../middlewares/authorize');
const permitRole = require("../middlewares/permitRole");

router.get("/", authorize, async function (req, res) {
    const shopingList = await shopingRepo.getAll({ user_id: req.user.id });
    if (shopingList) {
        res.status(200).json({
            result: 1,
            shopingList
        });
    }
});

router.get("/:id", authorize, async function (req, res) {
    const { id } = req.params;
    const collection = await collectionRepo.getById(id);
    if (!collection) {
        return res.status(400).json({
            result: 0,
            message: 'Collection not found'
        })
    } else {
        return res.status(200).json({
            result: 1,
            collection
        })
    }
});


router.post("/", authorize,
    permitRole('user'),
    async function (req, res) {
        const shopingList = {...req.body, user_id: req.user.id}
        const foundShopingItem = await shopingRepo.findShopingItem({ user_id: req.user.id, recipe_id: shopingList.recipe_id})
        if (foundShopingItem) {
            return res.status(400).json({
                result: 0,
                message: 'Item has been exist in Shoping List'
            })
        }
        const createdShopingList = await shopingRepo.create(shopingList);
        if (createdShopingList) {
            res.status(200).json({
                result: 1,
                createdShopingList
            });
        }
    });


router.delete("/:recipe_id", authorize, async (req, res) => {
    try {
        const deleteRecipe = await shopingRepo.removeRecipeFromShopingList({ recipe_id: req.params.recipe_id, user_id: req.user.id });
        return res.status(200).json({
            result: 1
        })
    } catch (error) {
        res.status(400).json({
            result: 0,
            message: error.message
        })
    }
})


module.exports = router;
