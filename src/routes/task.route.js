const { createTask, getAllTasks, getTaskById, getTodayTask, updateTask, updateTaskStatus, deleteTask } = require('../controllers/task.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createTaskSchema, updateTaskSchema, taskStatusSchema, queryDateRangeSchema } = require('../validators/task.validator');
const { paramSchema } = require('../validators/param.validator');

const router = require('express').Router();

router.use(auth);

router.post('/', validate(createTaskSchema), createTask);
router.get('/', validate(queryDateRangeSchema, 'query'), getAllTasks);
router.get('/today', getTodayTask);
router.get('/:id', validate(paramSchema, 'params'), getTaskById);
router.put('/:id', validate(paramSchema, 'params'), validate(updateTaskSchema), updateTask);
router.patch('/:id/status', validate(paramSchema, 'params'), validate(taskStatusSchema), updateTaskStatus);
router.delete('/:id', validate(paramSchema, 'params'), deleteTask);

module.exports = router;
