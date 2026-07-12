const Joi = require('joi');

const createTaskSchema = Joi.object({
    goalId: Joi.string().uuid().allow("").allow(null),
    title: Joi.string().max(255).required(),
    description: Joi.string().max(2000).allow("").allow(null),
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').default("TODO"),
    priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
    startDate: Joi.date(),
    dueDate: Joi.date().when('startDate', {
        is: Joi.date().required(),
        then: Joi.date().min(Joi.ref('startDate')),
        otherwise: Joi.date()
    }),
    isRecurring: Joi.boolean().default(false)
});

const updateTaskSchema = createTaskSchema.fork(['title'], (schema) => schema.optional());

const taskStatusSchema = Joi.object({
    status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE', 'MISSED').required()
});

// FIXED: use arrow function to evaluate at request time
const queryDateRangeSchema = Joi.object({
    from: Joi.date().default(() => new Date()),
    to: Joi.date().default(() => new Date())
});

module.exports = {
    createTaskSchema,
    updateTaskSchema,
    taskStatusSchema,
    queryDateRangeSchema
};
