const { register, login, logout, refresh } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const validateCookie = require('../middlewares/validateCookie');
const loginLimiter = require('../middlewares/loginLimiter');
const rateLimit = require('express-rate-limit');
const { createUserSchema, loginSchema } = require('../validators/user.validator');

const router = require('express').Router();

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: {
        success: false,
        errorCode: "TOO_MANY_REQUESTS",
        message: "Too many requests, please try again later"
    },
    standardHeaders: 'draft-8',
    legacyHeaders: false
});

router.post('/register', authLimiter, validate(createUserSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.delete('/logout', logout);
router.post('/refresh', authLimiter, validateCookie, refresh);

module.exports = router;
