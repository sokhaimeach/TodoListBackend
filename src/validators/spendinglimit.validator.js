const Joi = require('joi');

const createSpendingLimitSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  period: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY').required(),
  limitAmount: Joi.number().positive().required()
});

const updateSpendingLimitSchema = createSpendingLimitSchema.fork(['accountId', 'period', 'limitAmount'], (schema) => schema.optional());

module.exports = {
  createSpendingLimitSchema,
  updateSpendingLimitSchema
};
