const Joi = require('joi');

const createScheduleSchema = Joi.object({
  title: Joi.string().max(255).required(),
  repeatType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
  repeatDays: Joi.string().max(100).allow("").allow(null),
  startTime: Joi.string().max(20),
  endTime: Joi.string().max(20),
  isActive: Joi.boolean()
});

const updateScheduleSchema = createScheduleSchema.fork(['title', 'repeatType'], (schema) => schema.optional());

module.exports = {
  createScheduleSchema,
  updateScheduleSchema
};
