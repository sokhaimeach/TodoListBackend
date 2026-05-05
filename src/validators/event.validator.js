const Joi = require('joi');

const createSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  title: Joi.string().max(255).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')),
  reminder: Joi.string().max(50),
  color: Joi.string().max(20)
});

module.exports = {
  create: createSchema,
  update: createSchema
};