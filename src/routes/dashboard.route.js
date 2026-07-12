const {
    getDashboard, getQuickStats,
    getTaskStats, getGoalProgress, getHabitStats,
    getFinanceSummary, getMonthlyStats, getWeeklyCompletion
} = require('../controllers/dashboard.controller');
const auth = require('../middlewares/auth.middleware');

const router = require('express').Router();

router.use(auth);

router.get('/', getDashboard);
router.get('/quick', getQuickStats);
router.get('/tasks', getTaskStats);
router.get('/goals', getGoalProgress);
router.get('/habits', getHabitStats);
router.get('/finance', getFinanceSummary);
router.get('/monthly', getMonthlyStats);
router.get('/weekly-completion', getWeeklyCompletion);

module.exports = router;
