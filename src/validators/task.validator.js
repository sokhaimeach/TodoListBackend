const Joi = require('joi');

const createSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  goalId: Joi.string().uuid(),
  scheduleId: Joi.string().uuid(),
  title: Joi.string().max(255).required(),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
  startDate: Joi.date(),
  dueDate: Joi.date(),
  isRecurring: Joi.boolean(),
  completeAt: Joi.date()
});

module.exports = {
  create: createSchema,
  update: createSchema
};