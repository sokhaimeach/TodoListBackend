const ERROR_CODES = require("../constants/errorCode");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { Goal, Task, sequelize, GoalProgress } = require("../models");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/response");

// create goal
const createGoal = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { title, description, startDate, deadline, targetValue, currentValue, type, unit, status } = req.body;

    const goal = await Goal.create({
        userId: id,
        title,
        type,
        description,
        startDate,
        deadline,
        status,
        targetValue,
        currentValue,
        unit
    });

    return successResponse(res, "Create goal successfully", goal, 201);
});

// get all goal by user id
const getAllGoals = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const goals = await Goal.findAll({
        where: { userId: id },
        order: [["createdAt", "DESC"]]
    });

    return successResponse(res, "Get all goals successfully", goals);
});

// get goal by id
const getGoalById = asyncHandler(async (req, res) => {
    const goal = await Goal.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!goal) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
    }

    return successResponse(res, "Get goal successfully", goal);
});

// update goal by id
const updateGoal = asyncHandler(async (req, res) => {
    const goal = await Goal.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!goal) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
    }

    await goal.update(req.body);

    return successResponse(res, "Goal updated successfully", goal);
});

// update goal status by id 
const updateGoalStatusById = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { status } = req.body;

    // find goal and check ownership
    const goal = await Goal.findOne({ where: { id, userId } });
    if (!goal) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
    }

    goal.status = status;
    await goal.save();

    return successResponse(res, "Goal status updated successfully", goal);
});

// delete goal if no task history exists
const deleteGoal = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const t = await sequelize.transaction();

    try {
        // find goal and check onwership
        const goal = await Goal.findOne({ where: { id, userId }, transaction: t });
        if (!goal) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
        }

        // check if goal contains goal progress history
        const hasProgress = await GoalProgress.count({ where: { goalId: id }, transaction: t });
        if (hasProgress > 0) {
            throw new AppError(ERROR_CODES.EXIST, "Cannot delete goal with progress history", 409);
        }

        // check if goal contains task history
        const hasTasks = await Task.count({ where: { goalId: id }, transaction: t });
        if (hasTasks > 0) {
            throw new AppError(ERROR_CODES.EXIST, "Cannot delete goal with task history", 409);
        }

        await goal.destroy({ transaction: t });
        await t.commit();

        return successResponse(res, "Delete Goal successfully", goal);
    } catch (error) {
        await t.rollback();
        throw error;
    }
});



// set goalprogress
const setGoalProgress = asyncHandler(async (req, res) => {
    const { id: goalId } = req.params;
    const { id: userId } = req.user;
    const { status, value } = req.body;
    const t = await sequelize.transaction();

    try {
        // find goal and check onwership
        const goal = await Goal.findOne({ where: { id: goalId, userId }, transaction: t, lock: t.LOCK.UPDATE });
        if (!goal) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
        }

        // check goal status
        if (goal.status != "ACTIVE") {
            throw new AppError(ERROR_CODES.BAD_REQUEST, `This goal has been ${(goal.status).toLowerCase()}`, 400);
        }

        if (status == "DONE") {
            goal.currentValue += value;

            // check targetValue
            if (goal.targetValue <= goal.currentValue) {
                goal.status = "ACHIEVED";
            }

            await goal.save({ transaction: t });
        }

        const progress = await GoalProgress.create({ goalId, status, value }, { transaction: t });

        await t.commit();

        return successResponse(res, "Create progress successfully", progress, 201);
    } catch (error) {
        await t.rollback();
        throw error;
    }
});

// get goal progress
const getGoalProgress = asyncHandler(async (req, res) => {
    const { id: goalId } = req.params;
    const { id: userId } = req.user;

    const goal = await Goal.findOne({ where: { id: goalId, userId } });
    if (!goal) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Goal not found", 404);
    }

    const progress = await GoalProgress.findAll({
        where: { goalId },
        order: [["date", "DESC"]]
    });

    return successResponse(res, "Fetch goal progress successfully", progress);
});

module.exports = {
    createGoal,
    getAllGoals,
    getGoalById,
    updateGoal,
    updateGoalStatusById,
    deleteGoal,
    setGoalProgress,
    getGoalProgress
}
