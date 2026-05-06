const Joi = require('joi');

const createTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().required(),
  taskId: Joi.string().uuid(),
  categoryId: Joi.string().uuid(),
  description: Joi.string().max(1000),
  currency: Joi.string().valid('KHR', 'USD').required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('INCOME', 'EXPENSE').required(),
  date: Joi.date()
});

module.exports = {
  createTransactionSchema
};