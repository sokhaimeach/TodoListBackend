const Joi = require('joi');

const createSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  name: Joi.string().max(100).required(),
  icon: Joi.string().max(50),
  color: Joi.string().max(20)
});

module.exports = {
  create: createSchema,
  update: createSchema
};