const { getProfile, updateProfile, changePassword } = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { updateProfileSchema, changePasswordSchema } = require('../validators/user.validator');

const router = require('express').Router();

router.use(auth);

router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.put('/change-password', validate(changePasswordSchema), changePassword);

module.exports = router;
