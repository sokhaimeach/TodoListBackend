const Joi = require('joi');

const createUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER'),
    age: Joi.number().integer().min(0).max(150)
});

const loginSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(6).required()
}).or('username', 'email');

const updateProfileSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    email: Joi.string().email(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER'),
    age: Joi.number().integer().min(0).max(150)
}).min(1);

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

module.exports = {
    createUserSchema,
    loginSchema,
    updateProfileSchema,
    changePasswordSchema
};
