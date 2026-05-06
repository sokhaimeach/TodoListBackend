const Joi = require('joi');

const createCategorySchema = Joi.object({
  userId: Joi.string().uuid().required(),
  name: Joi.string().min(3).max(100).required(),
  icon: Joi.string().max(50).optional().allow(""),
  color: Joi.string().max(20).optional().allow("")
});

module.exports = {
  createCategorySchema
};