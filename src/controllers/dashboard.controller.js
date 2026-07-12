const { asyncHandler } = require('../middlewares/asyncHandler');
const { successResponse } = require('../utils/response');
const dashboardService = require('../services/dashboard.service');

// main dashboard summary
const getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const [
        todaySummary,
        overdueItems,
        taskStats,
        goalProgress,
        habitStats,
        financeSummary,
        monthlyStats,
        weeklyCompletion
    ] = await Promise.all([
        dashboardService.getTodaySummary(userId),
        dashboardService.getOverdueItems(userId),
        dashboardService.getTaskStats(userId),
        dashboardService.getGoalProgress(userId),
        dashboardService.getHabitStats(userId),
        dashboardService.getFinanceSummary(userId),
        dashboardService.getMonthlyStats(userId),
        dashboardService.getWeeklyTaskCompletion(userId)
    ]);

    return successResponse(res, "Dashboard fetched successfully", {
        todaySummary,
        overdueItems,
        taskStats,
        goalProgress,
        habitStats,
        financeSummary,
        monthlyStats,
        weeklyCompletion
    });
});

// lightweight dashboard (for mobile / quick view)
const getQuickStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const [taskStats, overdueItems, habitStats, financeSummary] = await Promise.all([
        dashboardService.getTaskStats(userId),
        dashboardService.getOverdueItems(userId),
        dashboardService.getHabitStats(userId),
        dashboardService.getFinanceSummary(userId)
    ]);

    return successResponse(res, "Quick stats fetched successfully", {
        overdueTasks: overdueItems.tasks,
        overdueGoals: overdueItems.goals,
        totalTasks: taskStats.total,
        completedTasks: taskStats.completed,
        completionRate: taskStats.completionRate,
        habitsDoneToday: habitStats.doneToday,
        habitsRemaining: habitStats.needToDo,
        totalBalance: financeSummary.totalBalance
    });
});

// individual stat endpoints for lazy loading

const getTaskStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getTaskStats(req.user.id);
    return successResponse(res, "Task stats fetched successfully", data);
});

const getGoalProgress = asyncHandler(async (req, res) => {
    const data = await dashboardService.getGoalProgress(req.user.id);
    return successResponse(res, "Goal progress fetched successfully", data);
});

const getHabitStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getHabitStats(req.user.id);
    return successResponse(res, "Habit stats fetched successfully", data);
});

const getFinanceSummary = asyncHandler(async (req, res) => {
    const data = await dashboardService.getFinanceSummary(req.user.id);
    return successResponse(res, "Finance summary fetched successfully", data);
});

const getMonthlyStats = asyncHandler(async (req, res) => {
    const data = await dashboardService.getMonthlyStats(req.user.id);
    return successResponse(res, "Monthly stats fetched successfully", data);
});

const getWeeklyCompletion = asyncHandler(async (req, res) => {
    const data = await dashboardService.getWeeklyTaskCompletion(req.user.id);
    return successResponse(res, "Weekly completion fetched successfully", data);
});

module.exports = {
    getDashboard,
    getQuickStats,
    getTaskStats,
    getGoalProgress,
    getHabitStats,
    getFinanceSummary,
    getMonthlyStats,
    getWeeklyCompletion
};
