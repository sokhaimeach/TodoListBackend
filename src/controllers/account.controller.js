const ERROR_CODES = require('../constants/errorCode');
const { INCOME, EXPENSE } = require('../constants/type');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Account, Transaction, SpendingLimit, sequelize } = require('../models');
const transaction = require('../models/transaction');
const AppError = require('../utils/AppError');
const { successResponse } = require('../utils/response');


// create account
const createAccount = asyncHandler(async (req, res) => {
    const account = await Account.create(req.body);

    return successResponse(res, "Create account successfully!", account);
});

// get all account
const getAllAccounts = asyncHandler(async (req, res) => {
    const accounts = await Account.findAll();
    if (accounts.length === 0) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Accounts not found", 404);
    }

    return successResponse(res, "Fetech all accounts successfully", accounts);
});

// delete account 
// can delete only in case no transaction yet or no spending limit
const deleteAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const account = await Account.findByPk(id);
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    // check ownership
    if (account.userId !== req.user.id) {
        throw new AppError(ERROR_CODES.FORBIDDEN, "Access denied", 403);
    }

    // check if account contains transactions history
    const hasIransaction = await Transaction.count({ where: { accountId: id } });
    if (hasIransaction > 0) {
        throw new AppError(ERROR_CODES.EXIST, "Cannot delete account with transaction history", 409);
    }

    // check spending limit rules
    const hasLimit = await SpendingLimit.count({ where: { accountId: id } });
    if (hasLimit > 0) {
        throw new AppError(ERROR_CODES.EXIST, "Cannot delete account with spending limit", 409);
    }

    await account.destroy();

    return successResponse(res, "Delete account successfully");
});

// transaction
const createTransaction = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { type, accountId, amount } = req.body;

        // find account
        const account = await Account.findByPk(accountId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!account) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found");
        }

        let newBalance;
        // incase user add money to balance
        if (type === INCOME) {
            newBalance = account.balance + amount;
        } else {
            // incase user use money
            if (account.balance < amount) {
                throw new AppError(ERROR_CODES.BAD_REQUEST, "Insufficient balance", 400);
            }

            newBalance = account.balance - amount;
        }

        account.balance = newBalance;

        const transaction = await Transaction.create(req.body, { transaction: t });
        await account.save({ transaction: t });

        await t.commit();
        return successResponse(res, "Create transaction successfully");
    } catch (err) {
        await t.rollback();
        throw err;
    }
});

// get transaction by account id
const getTransactionByAccountId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const transactions = await Transaction.findAll({ 
        where: { accountId: id}, 
        order: [["createdAt", "DESC"]]
    });
    if (transactions.length === 0) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Transaction not found", 404);
    }

    return successResponse(res, "Fetch transaction by account id successfully", transactions);
});

// create spending limit for account
const createSpendingLimit = asyncHandler(async (req, res) => {
    const { accountId } = req.body;

    // find account
    const account = await Account.findByPk(accountId);
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found");
    }

    const spendingLimit = await SpendingLimit.create(req.body);

    return successResponse(res, "Create spending limit successfully", spendingLimit);
});

// delete spending limit
const deleteSpendingLimit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const spendingLimit = await SpendingLimit.findByPk(id);
    if (!spendingLimit) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Spending limit not found");
    }

    await spendingLimit.destroy();
    return successResponse(res, "Delete spending limit successfully", spendingLimit);
});

module.exports = {
    createAccount,
    getAllAccounts,
    deleteAccount,
    createTransaction,
    getTransactionByAccountId,
    createSpendingLimit,
    deleteSpendingLimit
}