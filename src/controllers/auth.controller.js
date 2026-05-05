const { Op, where } = require('sequelize');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { User, UserRefreshToken, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');
const ERROR_CODES = require('../constants/errorCode');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/token');
const refreshTokenCookieOptions = require('../config/cookie');
const { SESSION_MAX } = require('../constants/session');

// sign up
const register = asyncHandler(async (req, res) => {
    const userData = req.body;

    const user = await User.create(userData);
    const { password: _, ...data } = user.toJSON();

    // generate access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await UserRefreshToken.create({
        userId: user.id,
        hashToken: hashToken(refreshToken),
        expiresAt: Date.now() + SESSION_MAX
    });

    // create secure cookie with refresh token
    res.cookie('jwt', refreshToken, refreshTokenCookieOptions);

    successResponse(res, "Register successfully", { ...data, accessToken }, 201);
});

// login
const login = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    // get user
    const user = await User.scope(null).findOne({
        where: { [Op.or]: [{ username }, { email }] }
    });
    if (!user) {
        throw new AppError(ERROR_CODES.USER_NOT_FOUND, "User not found", 404);
    }

    // check if password is match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Invalid credentials");
    }

    // generate access token and refresh token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await UserRefreshToken.create({
        userId: user.id,
        hashToken: hashToken(refreshToken),
        expiresAt: Date.now() + SESSION_MAX
    });

    // create secure cookie with refresh token
    res.cookie('jwt', refreshToken, refreshTokenCookieOptions);

    // remove password from user before send to client
    const { password: _, ...data } = user.toJSON();

    return successResponse(res, "Login successfully", { ...data, accessToken });
});

// refresh new access token
const refresh = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        throw new AppError(ERROR_CODES.UNAUTHORIZED, "Unauthorized", 401);
    }

    const refreshToken = cookies.jwt;
    const hashedToken = hashToken(refreshToken);

    const foundToken = await UserRefreshToken.findOne({
        where: { hashToken: hashedToken }
    });

    if (!foundToken) {
        throw new AppError(ERROR_CODES.FORBIDDEN, "Token reuse detected", 403);
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        // revoke all sessions on suspicious token
        await UserRefreshToken.destroy({ where: { userId: foundToken.userId } });

        throw new AppError(ERROR_CODES.FORBIDDEN, "Invalid or expired token", 403);
    }

    const foundUser = await User.findByPk(decoded.id);
    if (!foundUser) {
        throw new AppError(ERROR_CODES.FORBIDDEN, "Forbidden", 403);
    }

    // absolute session expiry
    if (foundToken.expiresAt < Date.now()) {
        await UserRefreshToken.destroy({ where: { userId: foundUser.id } });

        throw new AppError(ERROR_CODES.TOKEN_EXPIRED, "Session expired", 401);
    }

    const newRefreshToken = generateRefreshToken(foundUser);
    const accessToken = generateAccessToken(foundUser);

    await UserRefreshToken.create({
        userId: foundUser.id,
        hashToken: hashToken(newRefreshToken),
        expiresAt: foundToken.expiresAt
    });

    await foundToken.destroy();

    res.cookie('jwt', newRefreshToken, refreshTokenCookieOptions);

    return successResponse(res, "Refresh new token successfully", accessToken);
});

// logout
const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        return successResponse(res, "No content", 204);
    }

    await UserRefreshToken.destroy({ where: { hashToken: hashToken(cookies.jwt) } });

    // clear cookie
    res.clearCookie('jwt', refreshTokenCookieOptions);

    return successResponse(res, "Cookie cleared");
});

module.exports = {
    register,
    login,
    refresh,
    logout
}