const { createSchedule, getAllSchedules, getScheduleById, updateSchedule, deleteSchedule } = require('../controllers/schedule.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { paramSchema } = require('../validators/param.validator');
const { createScheduleSchema, updateScheduleSchema } = require('../validators/schedule.validator');

const router = require('express').Router();

router.use(auth);

router.post('/', validate(createScheduleSchema), createSchedule);
router.get('/', getAllSchedules);
router.get('/:id', validate(paramSchema, 'params'), getScheduleById);
router.put('/:id', validate(paramSchema, 'params'), validate(updateScheduleSchema), updateSchedule);
router.delete('/:id', validate(paramSchema, 'params'), deleteSchedule);

module.exports = router;
