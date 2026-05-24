const { asyncHandler } = require('../middlewares/asyncHandler');
const { Schedule, Task } = require('../models');
const ERROR_CODES = require('../constants/errorCode');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

// create schedule
const createSchedule = asyncHandler(async (req, res) => {
    const { id: userId } = req.user;
    const { title, repeatType, repeatDays, startTime, endTime } = req.body;

    const schedule = await Schedule.create({
        userId,
        title,
        repeatType,
        repeatDays,
        startTime,
        endTime
    });

    return successResponse(res, "Create schedule successfully", schedule, 201);
});

// get all schedules
const getAllSchedules = asyncHandler(async (req, res) => {
    const schedules = await Schedule.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]]
    });

    return successResponse(res, "Fetch schedules successfully", schedules);
});

// get schedule by id
const getScheduleById = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!schedule) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Schedule not found", 404);
    }

    return successResponse(res, "Fetch schedule successfully", schedule);
});

// update schedule
const updateSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!schedule) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Schedule not found", 404);
    }

    await schedule.update(req.body);

    return successResponse(res, "Update schedule successfully", schedule);
});

// delete schedule
const deleteSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!schedule) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Schedule not found", 404);
    }

    const hasTasks = await Task.count({ where: { scheduleId: schedule.id } });
    if (hasTasks > 0) {
        throw new AppError(ERROR_CODES.EXIST, "Cannot delete schedule with task history", 409);
    }

    await schedule.destroy();

    return successResponse(res, "Delete schedule successfully", schedule);
});

module.exports = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}
