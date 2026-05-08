const { createTask, getTodayTask } = require('../controllers/task.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createTaskSchema } = require('../validators/task.validator');

const router = require('express').Router();

router.use(auth);

router.post('/', validate(createTaskSchema), createTask);
router.get('/today', getTodayTask);

module.exports = router;