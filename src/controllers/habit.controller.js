const ERROR_CODES = require('../constants/errorCode');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Habit, HabitLog, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

const getOwnedHabit = async (habitId, userId, transaction = null) => {
    const habit = await Habit.findOne({
        where: { id: habitId, userId },
        transaction
    });

    if (!habit) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Habit not found", 404);
    }

    return habit;
};

const createHabit = asyncHandler(async (req, res) => {
    const habit = await Habit.create({
        userId: req.user.id,
        streakCount: 0,
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
    const habit = await getOwnedHabit(req.params.id, req.user.id);

    return successResponse(res, "Fetch habit successfully", habit);
});

const updateHabit = asyncHandler(async (req, res) => {
    const habit = await getOwnedHabit(req.params.id, req.user.id);

    await habit.update(req.body);

    return successResponse(res, "Update habit successfully", habit);
});

const deleteHabit = asyncHandler(async (req, res) => {
    const habit = await getOwnedHabit(req.params.id, req.user.id);

    await habit.destroy();

    return successResponse(res, "Delete habit successfully", habit);
});

const createHabitLog = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const habit = await getOwnedHabit(req.params.id, req.user.id, t);
        const log = await HabitLog.create({
            habitId: habit.id,
            ...req.body
        }, { transaction: t });

        if (req.body.status === "DONE") {
            habit.streakCount = Number(habit.streakCount || 0) + 1;
            habit.lastDoneAt = req.body.date;
            await habit.save({ transaction: t });
        }

        await t.commit();

        return successResponse(res, "Create habit log successfully", log, 201);
    } catch (error) {
        await t.rollback();
        throw error;
    }
});

const getHabitLogs = asyncHandler(async (req, res) => {
    const habit = await getOwnedHabit(req.params.id, req.user.id);
    const logs = await HabitLog.findAll({
        where: { habitId: habit.id },
        order: [["date", "DESC"]]
    });

    return successResponse(res, "Fetch habit logs successfully", logs);
});

const deleteHabitLog = asyncHandler(async (req, res) => {
    const habit = await getOwnedHabit(req.params.id, req.user.id);
    const log = await HabitLog.findOne({
        where: { id: req.params.logId, habitId: habit.id }
    });

    if (!log) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Habit log not found", 404);
    }

    await log.destroy();

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
