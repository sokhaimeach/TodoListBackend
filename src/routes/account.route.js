const {
    createAccount, getAllAccounts, getAccountById, updateAccount, deleteAccount,
    createTransaction, updateTransaction, deleteTransaction, getTransactionByAccountId,
    createSpendingLimit, getSpendingLimits, updateSpendingLimit, deleteSpendingLimit,
    getWeeklyExpense, getExpenseByCategory
} = require('../controllers/account.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createAccountSchema, updateAccountSchema } = require('../validators/account.validator');
const { paramSchema } = require('../validators/param.validator');
const { createSpendingLimitSchema, updateSpendingLimitSchema } = require('../validators/spendinglimit.validator');
const { createTransactionSchema, updateTransactionSchema } = require('../validators/transaction.validator');
const { transactionQuerySchema } = require('../validators/query.validator');

const router = require('express').Router();

router.use(auth);

// spending limit routes
router.post('/spending/limit', validate(createSpendingLimitSchema), createSpendingLimit);
router.get('/spending/limit', getSpendingLimits);
router.put('/spending/limit/:id', validate(paramSchema, 'params'), validate(updateSpendingLimitSchema), updateSpendingLimit);
router.delete('/spending/limit/:id', validate(paramSchema, 'params'), deleteSpendingLimit);

// account routes
router.post('/', validate(createAccountSchema), createAccount);
router.get('/', getAllAccounts);
router.get('/:id', validate(paramSchema, 'params'), getAccountById);
router.put('/:id', validate(paramSchema, 'params'), validate(updateAccountSchema), updateAccount);
router.delete('/:id', validate(paramSchema, 'params'), deleteAccount);

// transaction routes
router.post('/transactions', validate(createTransactionSchema), createTransaction);
router.put('/transactions/:id', validate(paramSchema, 'params'), validate(updateTransactionSchema), updateTransaction);
router.delete('/transactions/:id', validate(paramSchema, 'params'), deleteTransaction);
router.get('/transactions/:id', validate(paramSchema, 'params'), validate(transactionQuerySchema, 'query'), getTransactionByAccountId);

// reports
router.get('/reports/weekly/:id', validate(paramSchema, 'params'), getWeeklyExpense);
router.get('/reports/category/:id', validate(paramSchema, 'params'), getExpenseByCategory);

module.exports = router;
