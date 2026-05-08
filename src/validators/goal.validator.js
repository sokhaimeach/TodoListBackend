const Joi = require('joi');

const createGoalSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().max(1000).allow("").allow(null),
  startDate: Joi.date(),
  deadline: Joi.date(),
  status: Joi.string().valid('ACTIVE', 'ACHIEVED', 'ABANDONED').default("ACTIVE"),
  targetAmount: Joi.number().positive()
});

const goalStatusSchema = Joi.object({
  status: Joi.string().valid('ACTIVE', 'ACHIEVED', 'ABANDONED').required()
});

module.exports = {
  createGoalSchema,
  goalStatusSchema
};