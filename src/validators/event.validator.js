const Joi = require('joi');

const createEventSchema = Joi.object({
    title: Joi.string().max(255).required(),
    description: Joi.string().max(2000).allow("").allow(null),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')).messages({
        'date.greater': 'endDate must be after startDate'
    }),
    reminder: Joi.string().max(50),
    color: Joi.string().max(20)
});

const updateEventSchema = Joi.object({
    title: Joi.string().max(255),
    description: Joi.string().max(2000).allow("").allow(null),
    startDate: Joi.date(),
    endDate: Joi.date().when('startDate', {
        is: Joi.date().required(),
        then: Joi.date().greater(Joi.ref('startDate')),
        otherwise: Joi.date()
    }),
    reminder: Joi.string().max(50),
    color: Joi.string().max(20)
});

module.exports = {
    createEventSchema,
    updateEventSchema
};
