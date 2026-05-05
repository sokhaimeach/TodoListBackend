const Joi = require('joi');

const createSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  title: Joi.string().max(255).required(),
  frequencyType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
  frequencyDays: Joi.string().max(50),
  frequencyCount: Joi.number().integer().min(0),
  targetTime: Joi.date(),
  streakCount: Joi.number().integer().min(0),
  lastDoneAt: Joi.date(),
  startDate: Joi.date(),
  isActive: Joi.boolean()
});

module.exports = {
  create: createSchema,
  update: createSchema
};