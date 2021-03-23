const router = require("express").Router();
const categoryRepo = require("../repository/category.repo");
const collectionRepo = require("../repository/collection.repo");
const authorize = require('../middlewares/authorize');
const permitRole = require("../middlewares/permitRole");

router.get("/", authorize, async function (req, res) {
    const collections = await collectionRepo.getAll({ user_id: req.user.id });
    if (collections) {
        res.status(200).json({
            result: 1,
            collections
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

router.put("/:id", authorize, permitRole('user') ,(req, res) => {
    const { id } = req.params;
    const collection = req.body;
    try {
        collectionRepo.update(id, collection);
        return res.status(200).json({
            result: 1
        })
    } catch (error) {
        return res.status(400).json({
            result: 0,
            error: error.message
        })
    }
})
router.post("/", authorize,
    permitRole('user'),
    async function (req, res) {
        const collection = req.body;
        console.log({ collection })
        Object.assign(collection, { user_id: req.user.id })
        const createdCollection = await collectionRepo.create(collection);
        if (createdCollection) {
            res.status(200).json({
                result: 1,
                collection: createdCollection
            });
        }
    });


router.delete("/:id", authorize, async (req, res) => {
    try {
        const collection = await collectionRepo.remove(req.params.id);
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

router.post("/:collection_id/recipe/:recipe_id",
    authorize,
    permitRole('user'),
    async function (req, res) {
        try {
            const { collection_id, recipe_id } = req.params;
            const createdCollectionItem = await collectionRepo.addRecipeToCollection({ collection_id, recipe_id });
            if (createdCollectionItem) {
                res.status(200).json({
                    result: 1,
                    collectionItem: createdCollectionItem
                });
            }
        } catch (error) {
            return res.status(400).json({
                result: 0,
                message: error.message
            })
        }
    });

router.delete("/:collection_id/recipe/:recipe_id",
    authorize,
    permitRole('user'),
    async function (req, res) {
        const { collection_id, recipe_id } = req.params;
        const removedCollectionItem = await collectionRepo.removeRecipeFromCollection({ collection_id, recipe_id });
        if (removedCollectionItem) {
            res.status(200).json({
                result: 1,
                removedCollectionItem
            });
        }
    });

module.exports = router;
