const Joi = require('joi');

const createSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  title: Joi.string().max(255).required(),
  description: Joi.string().max(1000),
  startDate: Joi.date(),
  deadline: Joi.date(),
  status: Joi.string().valid('ACTIVE', 'ACHIEVED', 'ABANDONED'),
  targetAmount: Joi.number().positive(),
  currentAmount: Joi.number().min(0)
});

module.exports = {
  create: createSchema,
  update: createSchema
};