const { createAccount, getAllAccounts, deleteAccount, createTransaction, getTransactionByAccountId, createSpendingLimit, deleteSpendingLimit } = require('../controllers/account.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createAccountSchema } = require('../validators/account.validator');
const { paramSchema } = require('../validators/param.validator');
const { createSpendingLimitSchema } = require('../validators/spendinglimit.validator');
const { createTransactionSchema } = require('../validators/transaction.validator');

const router = require('express').Router();

router.use(auth);

// account routes
router.post('/', validate(createAccountSchema), createAccount);
router.get('/', getAllAccounts);
router.delete('/:id', validate(paramSchema, 'params'), deleteAccount);

// transactions routes
router.post('/transactions', validate(createTransactionSchema), createTransaction);
router.get('/transactions/:id', validate(paramSchema, 'params'), getTransactionByAccountId);

// spending limit routes
router.post('/spending-limit', validate(createSpendingLimitSchema), createSpendingLimit);
router.delete('spending-limit/:id', validate(paramSchema, 'params'), deleteSpendingLimit);

module.exports = router;
