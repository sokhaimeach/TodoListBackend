const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  icon: Joi.string().max(50).optional().allow(""),
  color: Joi.string().max(20).optional().allow("")
});

const updateCategorySchema = createCategorySchema.fork(['name'], (schema) => schema.optional());

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
