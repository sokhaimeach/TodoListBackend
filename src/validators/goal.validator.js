const Joi = require('joi');

const createGoalSchema = Joi.object({
    title: Joi.string().max(255).required(),
    type: Joi.string().valid("FINANCE", "EDUCATION", "HEALTH", "CAREER", "PERSONAL", "FITNESS").default("PERSONAL"),
    description: Joi.string().max(1000).allow("").allow(null),
    startDate: Joi.date(),
    deadline: Joi.date().when('startDate', {
        is: Joi.date().required(),
        then: Joi.date().min(Joi.ref('startDate')),
        otherwise: Joi.date()
    }),
    status: Joi.string().valid('ACTIVE', 'ACHIEVED', 'ABANDONED').default("ACTIVE"),
    targetValue: Joi.number().positive().required(),
    currentValue: Joi.number().min(0).default(0),
    unit: Joi.string().max(50).allow("").allow(null)
});

const updateGoalSchema = createGoalSchema.fork(['title', 'targetValue'], (schema) => schema.optional());

const goalStatusSchema = Joi.object({
    status: Joi.string().valid('ACTIVE', 'ACHIEVED', 'ABANDONED').required()
});

const createGoalProgressSchema = Joi.object({
    status: Joi.string().valid('DONE', 'MISSED').required(),
    value: Joi.number().positive().required()
});

module.exports = {
    createGoalSchema,
    updateGoalSchema,
    goalStatusSchema,
    createGoalProgressSchema
};
