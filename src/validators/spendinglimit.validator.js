const Joi = require('joi');

const createSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  period: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
  limitAmount: Joi.number().positive().required(),
  spentAmount: Joi.number().min(0),
  resetAt: Joi.date(),
  isExceeded: Joi.boolean()
});

module.exports = {
  create: createSchema,
  update: createSchema
};