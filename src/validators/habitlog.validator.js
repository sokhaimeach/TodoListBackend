const Joi = require('joi');

const createHabitLogSchema = Joi.object({
  date: Joi.date().required(),
  status: Joi.string().valid('DONE', 'SKIPPED', 'MISSED').required()
});

module.exports = {
  createHabitLogSchema
};
