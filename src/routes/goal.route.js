const { createGoal, getAllGoals, getGoalById, updateGoal, updateGoalStatusById, deleteGoal, setGoalProgress, getGoalProgress } = require('../controllers/goal.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createGoalSchema, updateGoalSchema, goalStatusSchema, createGoalProgressSchema } = require('../validators/goal.validator');
const { paramSchema } = require('../validators/param.validator');

const router = require('express').Router();

router.use(auth);

// goal
router.post('/', validate(createGoalSchema), createGoal);
router.get('/', getAllGoals);
router.get('/:id', validate(paramSchema, 'params'), getGoalById);
router.put('/:id',
    validate(paramSchema, 'params'),
    validate(updateGoalSchema),
    updateGoal
);
router.patch('/:id/status',
    validate(paramSchema, 'params'), 
    validate(goalStatusSchema), 
    updateGoalStatusById
);
router.delete('/:id',validate(paramSchema, 'params'), deleteGoal);

// progress
router.post('/:id/progress',
    validate(paramSchema, 'params'),
    validate(createGoalProgressSchema),
    setGoalProgress
);
router.get('/:id/progress', validate(paramSchema, 'params'), getGoalProgress);

module.exports = router;
