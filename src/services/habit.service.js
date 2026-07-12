const { Habit, HabitLog, sequelize } = require('../models');
const { Op } = require('sequelize');

const getOwnedHabit = async (habitId, userId, transaction = null) => {
    const habit = await Habit.findOne({
        where: { id: habitId, userId },
        transaction
    });

    if (!habit) {
        const AppError = require('../utils/AppError');
        const ERROR_CODES = require('../constants/errorCode');
        throw new AppError(ERROR_CODES.NOT_FOUND, "Habit not found", 404);
    }

    return habit;
};

/**
 * Recalculate streak from actual habit log data.
 * Streak = number of consecutive DONE days ending at the most recent DONE log.
 * If today has no log and yesterday was not DONE, streak = 0.
 */
const recalculateStreak = async (habitId) => {
    const logs = await HabitLog.findAll({
        where: {
            habitId,
            status: 'DONE'
        },
        order: [['date', 'DESC']],
        attributes: ['date']
    });

    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // check if the most recent done is today or yesterday
    const lastDate = new Date(logs[0].date);
    lastDate.setHours(0, 0, 0, 0);

    const diffFromToday = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    // streak broken if last done is more than 1 day ago
    if (diffFromToday > 1) return 0;

    // count consecutive days going backward
    let prevDate = null;
    for (const log of logs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);

        if (prevDate === null) {
            streak = 1;
            prevDate = logDate;
            continue;
        }

        const diff = Math.floor((prevDate - logDate) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
            streak++;
            prevDate = logDate;
        } else {
            break;
        }
    }

    return streak;
};

module.exports = {
    getOwnedHabit,
    recalculateStreak
};
