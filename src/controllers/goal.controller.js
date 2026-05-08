const ERROR_CODES = require("../constants/errorCode");
const { asyncHandler } = require("../middlewares/asyncHandler");
const { Goal, User, Task, sequelize } = require("../models");
const AppError = require("../utils/AppError");
const { successResponse } = require("../utils/response");

// create goal
const createGoal = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { title, description, startDate, deadline, targetValue, type } = req.body;

    const goal = await Goal.create({
        userId: id,
        title,
        type,
        description,
        startDate,
        deadline,
        targetValue
    });

    return successResponse(res, "Create goal successfully", goal);
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
    
        // check if goal contains task history
        const hasTasks = await Task.count({ where: { goalId: id }, transaction: t });
        if (hasTasks > 0) {
            throw new AppError(ERROR_CODES.EXIST, "Cannot delete goal with task history", 409);
        }
    
        await goal.destroy({transaction: t});
        await t.commit();
    
        return successResponse(res, "Delete Goal successfully", goal);
    } catch(error) {
        await t.rollback();
        throw error;
    }
});

module.exports = {
    createGoal,
    getAllGoals,
    updateGoalStatusById,
    deleteGoal
}