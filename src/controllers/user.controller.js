const { asyncHandler } = require('../middlewares/asyncHandler');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCode');
const { successResponse } = require('../utils/response');
const bcrypt = require('bcryptjs');

// get current user profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    return successResponse(res, "Profile fetched successfully", user);
});

// update profile (username, firstName, lastName, gender, age)
const updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = ['firstName', 'lastName', 'gender', 'age'];
    const updates = {};

    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    }

    // username can be updated but must be unique
    if (req.body.username) {
        const existingUser = await User.findOne({
            where: { username: req.body.username.toLowerCase() }
        });
        if (existingUser && existingUser.id !== req.user.id) {
            throw new AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS, "Username already taken", 409);
        }
        updates.username = req.body.username.toLowerCase();
    }

    // email can be updated but must be unique
    if (req.body.email) {
        const existingUser = await User.findOne({
            where: { email: req.body.email.toLowerCase() }
        });
        if (existingUser && existingUser.id !== req.user.id) {
            throw new AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS, "Email already in use", 409);
        }
        updates.email = req.body.email.toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
        throw new AppError(ERROR_CODES.BAD_REQUEST, "No valid fields to update", 400);
    }

    await User.update(updates, { where: { id: req.user.id }, individualHooks: true });
    const updatedUser = await User.findByPk(req.user.id);

    return successResponse(res, "Profile updated successfully", updatedUser);
});

// change password
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.scope(null).findByPk(req.user.id);
    if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Current password is incorrect", 401);
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, "Password changed successfully");
});

module.exports = {
    getProfile,
    updateProfile,
    changePassword
};
