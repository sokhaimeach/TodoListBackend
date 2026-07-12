const { Op } = require('sequelize');
const ERROR_CODES = require('../constants/errorCode');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Task, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const { formatDateHour } = require('../utils/formatDate');
const taskService = require('../services/task.service');

// create task
const createTask = asyncHandler(async (req, res) => {
    const taskData = taskService.normalizeNullableIds(req.body);
    const { goalId } = taskData;
    const { id } = req.user;

    await taskService.assertGoalOwnership({ goalId, userId: id });

    const task = await Task.create({
        userId: id,
        ...taskData
    });

    return successResponse(res, "Create task successfully", task, 201);
});

// get all tasks
const getAllTasks = asyncHandler(async (req, res) => {
    const { from, to } = req.query;

    const tasks = await Task.findAll({
        where: {
            userId: req.user.id,
            startDate: {
                [Op.gte]: formatDateHour(from),
                [Op.lte]: formatDateHour(to, "to")
            }
        },
        order: [
            ["startDate", "DESC"],
            [sequelize.literal(taskService.priorityOrderLiteral)],
        ]
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
        order: [
            ["startDate", "DESC"],
            [sequelize.literal(taskService.priorityOrderLiteral)],
        ]
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

    const taskData = taskService.normalizeNullableIds(req.body);
    await taskService.assertGoalOwnership({
        goalId: taskData.goalId,
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
    task.completedAt = req.body.status === "DONE" ? new Date() : null;
    await task.save();

    return successResponse(res, "Update task status successfully", task);
});

// delete task (soft delete not implemented yet — hard delete)
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
};
