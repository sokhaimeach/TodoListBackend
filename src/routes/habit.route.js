const { createHabit, getAllHabits, getHabitById, updateHabit, deleteHabit, createHabitLog, getHabitLogs, deleteHabitLog } = require('../controllers/habit.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createHabitSchema, updateHabitSchema } = require('../validators/habit.validator');
const { createHabitLogSchema } = require('../validators/habitlog.validator');
const { paramSchema, habitLogParamSchema } = require('../validators/param.validator');

const router = require('express').Router();

router.use(auth);

router.post('/', validate(createHabitSchema), createHabit);
router.get('/', getAllHabits);
router.get('/:id', validate(paramSchema, 'params'), getHabitById);
router.put('/:id', validate(paramSchema, 'params'), validate(updateHabitSchema), updateHabit);
router.delete('/:id', validate(paramSchema, 'params'), deleteHabit);
router.post('/:id/logs', validate(paramSchema, 'params'), validate(createHabitLogSchema), createHabitLog);
router.get('/:id/logs', validate(paramSchema, 'params'), getHabitLogs);
router.delete('/:id/logs/:logId', validate(habitLogParamSchema, 'params'), deleteHabitLog);

module.exports = router;
