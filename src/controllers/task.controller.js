const { Op } = require('sequelize');
const ERROR_CODES = require('../constants/errorCode');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Task, Goal, Schedule } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

const normalizeNullableIds = (data) => {
    const normalized = { ...data };

    if (Object.prototype.hasOwnProperty.call(normalized, 'goalId')) {
        normalized.goalId = normalized.goalId || null;
    }

    if (Object.prototype.hasOwnProperty.call(normalized, 'scheduleId')) {
        normalized.scheduleId = normalized.scheduleId || null;
    }

    return normalized;
};

const assertGoalAndScheduleOwnership = async ({ goalId, scheduleId, userId }) => {
    if (goalId) {
        const goal = await Goal.findOne({ where: { id: goalId, userId } });
        if (!goal) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
        }
    }

    if (scheduleId) {
        const schedule = await Schedule.findOne({ where: { id: scheduleId, userId } });
        if (!schedule) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Schedule not found", 404);
        }
    }
};

// create task
const createTask = asyncHandler(async (req, res) => {
    const taskData = normalizeNullableIds(req.body);
    const { goalId, scheduleId } = taskData;
    const { id } = req.user;

    await assertGoalAndScheduleOwnership({ goalId, scheduleId, userId: id });

    const task = await Task.create({ 
        userId: id, 
        ...taskData
    });

    return successResponse(res, "Create task successfully", task, 201);
});

// get all tasks
const getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]]
    });

    return successResponse(res, "Fetch tasks successfully", tasks);
});

// get task by id
const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Task not found", 404);
    }

    return successResponse(res, "Fetch task successfully", task);
});

// get today task
const getTodayTask = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const tasks = await Task.findAll({ 
        where: { 
            userId: id,
            startDate: {
                [Op.gte]: startOfDay,
                [Op.lt]: endOfDay
            }
        },
        order: [["startDate", "ASC"]]
    });

    return successResponse(res, "Fetch tasks successfully", tasks);
});

// update task
const updateTask = asyncHandler(async (req, res) => {
    const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Task not found", 404);
    }

    const taskData = normalizeNullableIds(req.body);
    await assertGoalAndScheduleOwnership({
        goalId: taskData.goalId,
        scheduleId: taskData.scheduleId,
        userId: req.user.id
    });

    await task.update(taskData);

    return successResponse(res, "Update task successfully", task);
});

// update task status
const updateTaskStatus = asyncHandler(async (req, res) => {
    const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Task not found", 404);
    }

    task.status = req.body.status;
    task.completeAt = req.body.status === "DONE" ? new Date() : null;
    await task.save();

    return successResponse(res, "Update task status successfully", task);
});

// delete task
const deleteTask = asyncHandler(async (req, res) => {
    const task = await Task.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!task) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Task not found", 404);
    }

    await task.destroy();

    return successResponse(res, "Delete task successfully", task);
});

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    getTodayTask,
    updateTask,
    updateTaskStatus,
    deleteTask
}
