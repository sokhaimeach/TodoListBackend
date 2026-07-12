const Joi = require('joi');

const transactionQuerySchema = Joi.object({
  date: Joi.date().iso()
});

module.exports = {
  transactionQuerySchema
};
