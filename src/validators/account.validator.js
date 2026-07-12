const Joi = require('joi');

const createAccountSchema = Joi.object({
    name: Joi.string().max(100).required(),
    balance: Joi.number().min(0).default(0),
    currency: Joi.string().valid('KHR', 'USD').default('KHR')
});

// balance cannot be updated directly; only through transactions
const updateAccountSchema = Joi.object({
    name: Joi.string().max(100),
    currency: Joi.string().valid('KHR', 'USD')
});

module.exports = {
    createAccountSchema,
    updateAccountSchema
};
