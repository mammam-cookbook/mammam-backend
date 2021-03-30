const router = require("express").Router();
const categoryRepo = require("../repository/category.repo");
const authorize = require('../middlewares/authorize');
const permitRole = require("../middlewares/permitRole");


const convertCategoryArrayToTreeArray = (arr) => {
    const hashObj = {};
    arr.forEach((item) => {
      hashObj[item.id] = item;
      item.dataValues.childrenCategories = [];
    });
  
    const result = [];
    arr.forEach((item) => {
      if (item.dataValues.parent_category_id !== null) {
        hashObj[item.parent_category_id].dataValues.childrenCategories.push(item);
      } else {
        result.push(item);
      }
    });
  
    return result;
  };

router.get("/", async function (req, res) {
    const categories = await categoryRepo.getAll();
    const countResult = categories.count;
    const categoriesResult = convertCategoryArrayToTreeArray(categories.rows);
    if (categories) {
        res.status(200).json({
            result: 1,
            categories: {
                countResult,
                categoriesResult
            }
        });
    }
});

router.put("/:id",
    authorize,
    permitRole('mod', 'admin'),
    (req, res) => {
        const { id } = req.params;
        const category = req.body;
        try {
            categoryRepo.update(id, category);
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
router.post("/",
    authorize,
    permitRole('user', 'admin'),
    async function (req, res) {
        const category = req.body;
        Object.assign(category, { user_id: req.user.id })
        const createdCategory = await categoryRepo.create(category);
        if (createdCategory) {
            res.status(200).json({
                result: 1,
                category: createdCategory
            });
        }
    });


router.delete("/:id", authorize, async (req, res) => {
    try {
        const category = await categoryRepo.remove(req.params.id);
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
