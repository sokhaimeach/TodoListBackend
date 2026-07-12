const { Task, Goal } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCode');

const normalizeNullableIds = (data) => {
    const normalized = { ...data };

    if (Object.prototype.hasOwnProperty.call(normalized, 'goalId')) {
        normalized.goalId = normalized.goalId || null;
    }

    return normalized;
};

const assertGoalOwnership = async ({ goalId, userId }) => {
    if (goalId) {
        const goal = await Goal.findOne({ where: { id: goalId, userId } });
        if (!goal) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
        }
    }
};

const priorityOrderLiteral = `
    CASE
        WHEN priority = 'URGENT' THEN 1
        WHEN priority = 'HIGH' THEN 2
        WHEN priority = 'MEDIUM' THEN 3
        WHEN priority = 'LOW' THEN 4
    END
`;

module.exports = {
    normalizeNullableIds,
    assertGoalOwnership,
    priorityOrderLiteral
};
