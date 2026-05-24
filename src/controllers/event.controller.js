const ERROR_CODES = require('../constants/errorCode');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Event } = require('../models');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');

const createEvent = asyncHandler(async (req, res) => {
    const event = await Event.create({
        userId: req.user.id,
        ...req.body
    });

    return successResponse(res, "Create event successfully", event, 201);
});

const getAllEvents = asyncHandler(async (req, res) => {
    const events = await Event.findAll({
        where: { userId: req.user.id },
        order: [["startDate", "ASC"]]
    });

    return successResponse(res, "Fetch events successfully", events);
});

const getEventById = asyncHandler(async (req, res) => {
    const event = await Event.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!event) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found", 404);
    }

    return successResponse(res, "Fetch event successfully", event);
});

const updateEvent = asyncHandler(async (req, res) => {
    const event = await Event.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!event) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found", 404);
    }

    await event.update(req.body);

    return successResponse(res, "Update event successfully", event);
});

const deleteEvent = asyncHandler(async (req, res) => {
    const event = await Event.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!event) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Event not found", 404);
    }

    await event.destroy();

    return successResponse(res, "Delete event successfully", event);
});

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
