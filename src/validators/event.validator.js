const Joi = require('joi');

const createEventSchema = Joi.object({
  title: Joi.string().max(255).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().when('startDate', {
    is: Joi.exist(),
    then: Joi.date().greater(Joi.ref('startDate')),
    otherwise: Joi.date()
  }),
  reminder: Joi.string().max(50),
  color: Joi.string().max(20)
});

const updateEventSchema = createEventSchema.fork(['title', 'startDate'], (schema) => schema.optional());

module.exports = {
  createEventSchema,
  updateEventSchema
};
