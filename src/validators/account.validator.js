const Joi = require('joi');

const createAccountSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  name: Joi.string().max(100).required(),
  balance: Joi.number().min(0),
  currency: Joi.string().valid('KHR', 'USD')
});

module.exports = {
  create: createSchema,
  update: createSchema
};