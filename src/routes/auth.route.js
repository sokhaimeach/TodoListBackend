const { register, login, logout, refresh } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const validateCookie = require('../middlewares/validateCookie');
const loginLimiter = require('../middlewares/loginLimiter');
const { createUserSchema, loginSchema } = require('../validators/user.validator');

const router = require('express').Router();

router.post('/register', validate(createUserSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.delete('/logout', logout);
router.post('/refresh', validateCookie, refresh);

module.exports = router;
