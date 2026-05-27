const Joi = require('joi');

const createTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  categoryId: Joi.string().uuid().allow(null),
  description: Joi.string().max(1000),
  currency: Joi.string().valid('KHR', 'USD').required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('INCOME', 'EXPENSE').required(),
  date: Joi.date()
});

module.exports = {
  createTransactionSchema
};
