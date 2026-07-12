const Joi = require('joi');

const createHabitSchema = Joi.object({
    title: Joi.string().max(255).required(),
    frequencyType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
    frequencyDays: Joi.string().max(50),
    frequencyCount: Joi.number().integer().min(0),
    targetTime: Joi.date(),
    startDate: Joi.date(),
    isActive: Joi.boolean().default(true)
});

const updateHabitSchema = createHabitSchema.fork(['title', 'frequencyType'], (schema) => schema.optional());

module.exports = {
    createHabitSchema,
    updateHabitSchema
};
