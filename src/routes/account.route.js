const { createAccount, getAllAccounts, getAccountById, updateAccount, deleteAccount, createTransaction, getTransactionByAccountId, createSpendingLimit, getSpendingLimits, updateSpendingLimit, deleteSpendingLimit } = require('../controllers/account.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createAccountSchema, updateAccountSchema } = require('../validators/account.validator');
const { paramSchema } = require('../validators/param.validator');
const { createSpendingLimitSchema, updateSpendingLimitSchema } = require('../validators/spendinglimit.validator');
const { createTransactionSchema } = require('../validators/transaction.validator');

const router = require('express').Router();

router.use(auth);

// account routes
router.post('/', validate(createAccountSchema), createAccount);
router.get('/', getAllAccounts);

// transactions routes
router.post('/transactions', validate(createTransactionSchema), createTransaction);
router.get('/transactions/:id', validate(paramSchema, 'params'), getTransactionByAccountId);

// spending limit routes
router.post('/spending-limit', validate(createSpendingLimitSchema), createSpendingLimit);
router.get('/spending-limit', getSpendingLimits);
router.put('/spending-limit/:id', validate(paramSchema, 'params'), validate(updateSpendingLimitSchema), updateSpendingLimit);
router.delete('/spending-limit/:id', validate(paramSchema, 'params'), deleteSpendingLimit);

router.get('/:id', validate(paramSchema, 'params'), getAccountById);
router.put('/:id', validate(paramSchema, 'params'), validate(updateAccountSchema), updateAccount);
router.delete('/:id', validate(paramSchema, 'params'), deleteAccount);

module.exports = router;
