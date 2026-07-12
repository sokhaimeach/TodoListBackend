const ERROR_CODES = require('../constants/errorCode');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Habit, HabitLog, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');
const habitService = require('../services/habit.service');

const createHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.create({
        userId: req.user.id,
        isActive: true,
        ...req.body
    });

    return successResponse(res, "Create habit successfully", habit, 201);
});

const getAllHabits = asyncHandler(async (req, res) => {
    const habits = await Habit.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]]
    });

    return successResponse(res, "Fetch habits successfully", habits);
});

const getHabitById = asyncHandler(async (req, res) => {
    const habit = await habitService.getOwnedHabit(req.params.id, req.user.id);

    return successResponse(res, "Fetch habit successfully", habit);
});

const updateHabit = asyncHandler(async (req, res) => {
    const habit = await habitService.getOwnedHabit(req.params.id, req.user.id);

    await habit.update(req.body);

    return successResponse(res, "Update habit successfully", habit);
});

const deleteHabit = asyncHandler(async (req, res) => {
    const habit = await habitService.getOwnedHabit(req.params.id, req.user.id);

    await habit.destroy();

    return successResponse(res, "Delete habit successfully", habit);
});

const createHabitLog = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const habit = await habitService.getOwnedHabit(req.params.id, req.user.id, t);

        // check if log already exists for this date
        const logDate = req.body.date ? new Date(req.body.date) : new Date();
        logDate.setHours(0, 0, 0, 0);

        const existingLog = await HabitLog.findOne({
            where: {
                habitId: habit.id,
                date: logDate.toISOString().split('T')[0]
            },
            transaction: t
        });

        if (existingLog) {
            throw new AppError(ERROR_CODES.CONFLICT, "Habit log already exists for this date", 409);
        }

        const log = await HabitLog.create({
            habitId: habit.id,
            date: logDate.toISOString().split('T')[0],
            status: req.body.status
        }, { transaction: t });

        // recalculate streak after any log
        await t.commit();

        const streak = await habitService.recalculateStreak(habit.id);
        await Habit.update({ streakCount: streak }, { where: { id: habit.id } });

        return successResponse(res, "Create habit log successfully", log, 201);
    } catch (error) {
        await t.rollback();
        throw error;
    }
});

const getHabitLogs = asyncHandler(async (req, res) => {
    const habit = await habitService.getOwnedHabit(req.params.id, req.user.id);
    const logs = await HabitLog.findAll({
        where: { habitId: habit.id },
        order: [["date", "DESC"]]
    });

    return successResponse(res, "Fetch habit logs successfully", logs);
});

const deleteHabitLog = asyncHandler(async (req, res) => {
    const habit = await habitService.getOwnedHabit(req.params.id, req.user.id);
    const log = await HabitLog.findOne({
        where: { id: req.params.logId, habitId: habit.id }
    });

    if (!log) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Habit log not found", 404);
    }

    await log.destroy();

    // recalculate streak after deleting a log
    const streak = await habitService.recalculateStreak(habit.id);
    await Habit.update({ streakCount: streak, lastDoneAt: null }, { where: { id: habit.id } });

    return successResponse(res, "Delete habit log successfully", log);
});

module.exports = {
    createHabit,
    getAllHabits,
    getHabitById,
    updateHabit,
    deleteHabit,
    createHabitLog,
    getHabitLogs,
    deleteHabitLog
};
