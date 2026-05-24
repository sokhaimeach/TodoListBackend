const Joi = require('joi');

const createTaskSchema = Joi.object({
  goalId: Joi.string().uuid().allow("").allow(null),
  scheduleId: Joi.string().uuid().allow("").allow(null),
  title: Joi.string().max(255).required(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').default("TODO"),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
  startDate: Joi.date(),
  dueDate: Joi.date(),
  isRecurring: Joi.boolean().default(false),
  completeAt: Joi.date().optional().allow(null)
});

const updateTaskSchema = createTaskSchema.fork(['title'], (schema) => schema.optional());
const taskStatusSchema = Joi.object({
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').required()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskStatusSchema
};
