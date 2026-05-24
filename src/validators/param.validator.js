const Joi = require('joi');

// Reusable delete schema
const paramSchema = Joi.object({
  id: Joi.string().uuid().required()
});

const habitLogParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
  logId: Joi.string().uuid().required()
});

module.exports = {
  paramSchema,
  habitLogParamSchema
};
