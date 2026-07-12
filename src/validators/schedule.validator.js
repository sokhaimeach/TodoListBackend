const Joi = require('joi');

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const createScheduleSchema = Joi.object({
    title: Joi.string().max(255).required(),
    repeatType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
    repeatDays: Joi.string().max(100).allow("").allow(null),
    startTime: Joi.string().pattern(timePattern).messages({
        'string.pattern.base': 'startTime must be in HH:mm or HH:mm:ss format'
    }),
    endTime: Joi.string().pattern(timePattern).messages({
        'string.pattern.base': 'endTime must be in HH:mm or HH:mm:ss format'
    }),
    isActive: Joi.boolean()
});

const updateScheduleSchema = createScheduleSchema.fork(['title', 'repeatType'], (schema) => schema.optional());

module.exports = {
    createScheduleSchema,
    updateScheduleSchema
};
