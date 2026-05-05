const Joi = require('joi');

const createSchema = Joi.object({
  habitId: Joi.string().uuid().required(),
  date: Joi.date().required(),
  status: Joi.string().valid('DONE', 'SKIPPED', 'MISSED').required()
});

module.exports = {
  create: createSchema,
  update: createSchema
};