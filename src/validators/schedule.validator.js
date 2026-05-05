const Joi = require('joi');

const createSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  title: Joi.string().max(255).required(),
  repeatType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
  repeatDays: Joi.string().max(50),
  startTime: Joi.date(),
  endTime: Joi.date(),
  isActive: Joi.boolean()
});

module.exports = {
  create: createSchema,
  update: createSchema
};