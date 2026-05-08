const { Op } = require('sequelize');
const ERROR_CODES = require('../constants/errorCode');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Task, Goal, Schedule } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

// create task
const createTask = asyncHandler(async (req, res) => {
    const { title, goalId, scheduleId, priority, startDate, dueDate } = req.body;
    const { id } = req.user;

    // check goal
    if (goalId) {
        const goal = await Goal.findByPk(goalId);
        if (!goal) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
        }
    }

    // check shcedule
    if (scheduleId) {
        const schedule = await Schedule.findByPk(scheduleId);
        if (!schedule) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Schedule not found", 404);
        }
    }

    const task = await Task.create({ 
        userId: id, 
        title, 
        goalId, 
        scheduleId, 
        priority, 
        startDate, 
        dueDate 
    });

    return successResponse(res, "Create task successfully", task);
});

// get today task
const getTodayTask = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const today = new Date();

    const tasks = await Task.findAll({ 
        where: { 
            [Op.and]: [
                {userId: id}, 
                {startDate: today}
            ]
        }
    });

    if (tasks.length === 0) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Tasks not found", 404);
    }

    return successResponse(res, "Fetch tasks successfully", tasks);
});

module.exports = {
    createTask,
    getTodayTask
}