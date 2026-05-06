const { createCategory, getAllCategories, updateCategory, deleteCategory } = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createCategorySchema } = require('../validators/category.validator');
const { paramSchema } = require('../validators/param.validator');

const router = require('express').Router();

router.use(auth);

router.post('/', validate(createCategorySchema), createCategory);
router.get('/', getAllCategories);
router.put('/:id', 
    validate(paramSchema, 'params'), 
    validate(createCategorySchema), 
    updateCategory
);
router.delete('/:id', validate(paramSchema, 'params'), deleteCategory);

module.exports = router;