const { createGoal, getAllGoals, updateGoalStatusById, deleteGoal } = require('../controllers/goal.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createGoalSchema, goalStatusSchema } = require('../validators/goal.validator');
const { paramSchema } = require('../validators/param.validator');

const router = require('express').Router();

router.use(auth);

router.post('/', validate(createGoalSchema), createGoal);
router.get('/', getAllGoals);
router.put('/:id', 
    validate(paramSchema, 'params'), 
    validate(goalStatusSchema), 
    updateGoalStatusById
);
router.delete('/:id',validate(paramSchema, 'params'), deleteGoal);

module.exports = router;