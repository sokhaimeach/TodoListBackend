const Joi = require('joi');

const createAccountSchema = Joi.object({
  name: Joi.string().max(100).required(),
  balance: Joi.number().min(0),
  currency: Joi.string().valid('KHR', 'USD')
});

const updateAccountSchema = createAccountSchema.fork(['name'], (schema) => schema.optional());

module.exports = {
  createAccountSchema,
  updateAccountSchema
};
