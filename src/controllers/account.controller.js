const { Op } = require('sequelize');
const ERROR_CODES = require('../constants/errorCode');
const { INCOME, EXPENSE } = require('../constants/type');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Account, Transaction, SpendingLimit, Category, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { getStartOfWeek, getEndOfWeek } = require('../utils/formatDate');
const { successResponse } = require('../utils/response');


// create account
const createAccount = asyncHandler(async (req, res) => {
    const account = await Account.create({
        userId: req.user.id,
        ...req.body
    });

    return successResponse(res, "Create account successfully", account, 201);
});

// get all account
const getAllAccounts = asyncHandler(async (req, res) => {
    const { id } = req.user;

    const accounts = await Account.findAll({ where: { userId: id } });
    return successResponse(res, "Fetch all accounts successfully", accounts);
});

// get account by id
const getAccountById = asyncHandler(async (req, res) => {
    const account = await Account.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });

    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    return successResponse(res, "Fetch account successfully", account);
});

// update account
const updateAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const account = await Account.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    await account.update(req.body);

    return successResponse(res, "Update account successfully", account);
});

// delete account 
// can delete only in case no transaction yet or no spending limit
const deleteAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const account = await Account.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    // check if account contains transactions history
    const hasTransaction = await Transaction.count({ where: { accountId: id } });
    if (hasTransaction > 0) {
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
        const { type, accountId, categoryId, amount } = req.body;

        // find account
        const account = await Account.findOne({
            where: { id: accountId, userId: req.user.id },
            transaction: t,
            lock: t.LOCK.UPDATE
        });
        if (!account) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
        }

        if (categoryId) {
            const category = await Category.findOne({
                where: { id: categoryId, userId: req.user.id },
                transaction: t
            });
            if (!category) {
                throw new AppError(ERROR_CODES.NOT_FOUND, "Category not found", 404);
            }
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
        return successResponse(res, "Create transaction successfully", transaction, 201);
    } catch (err) {
        await t.rollback();
        throw err;
    }
});

// get transaction by account id
const getTransactionByAccountId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const account = await Account.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    const transactions = await Transaction.findAll({
        where: { accountId: id },
        order: [["createdAt", "DESC"]]
    });

    return successResponse(res, "Fetch transaction by account id successfully", transactions);
});

// create spending limit for account
const createSpendingLimit = asyncHandler(async (req, res) => {
    const { accountId } = req.body;

    // find account
    const account = await Account.findOne({
        where: { id: accountId, userId: req.user.id }
    });
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    const spendingLimit = await SpendingLimit.create({
        userId: req.user.id,
        ...req.body
    });

    return successResponse(res, "Create spending limit successfully", spendingLimit, 201);
});

// get spending limits
const getSpendingLimits = asyncHandler(async (req, res) => {
    const limits = await SpendingLimit.findAll({
        where: { userId: req.user.id },
        order: [["createdAt", "DESC"]]
    });

    return successResponse(res, "Fetch spending limits successfully", limits);
});

// update spending limit
const updateSpendingLimit = asyncHandler(async (req, res) => {
    const spendingLimit = await SpendingLimit.findOne({
        where: { id: req.params.id, userId: req.user.id }
    });
    if (!spendingLimit) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Spending limit not found", 404);
    }

    if (req.body.accountId) {
        const account = await Account.findOne({
            where: { id: req.body.accountId, userId: req.user.id }
        });
        if (!account) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
        }
    }

    await spendingLimit.update(req.body);

    return successResponse(res, "Update spending limit successfully", spendingLimit);
});

// delete spending limit
const deleteSpendingLimit = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const spendingLimit = await SpendingLimit.findOne({
        where: { id, userId: req.user.id }
    });
    if (!spendingLimit) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Spending limit not found", 404);
    }

    await spendingLimit.destroy();
    return successResponse(res, "Delete spending limit successfully", spendingLimit);
});

const getWeeklyExpense = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;

    const account = await Account.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
        return successResponse(res, "Fetch weekly transactions successfully", { weeklyData: [], label: "" });
    }

    const transactions = await Transaction.findAll({
        where: {
            accountId: id,
            type: "EXPENSE",
            createdAt: {
                [Op.gte]: getStartOfWeek(date),
                [Op.lte]: getEndOfWeek(date),
            },
        },
        attributes: [
            [sequelize.fn("DATE", sequelize.col("createdAt")), "date"],
            [sequelize.fn("SUM", sequelize.col("amount")), "amount"],
        ],
        group: [sequelize.fn("DATE", sequelize.col("createdAt"))],
        order: [[sequelize.fn("DATE", sequelize.col("createdAt")), "DESC"]],
    });

    const data = [];
    const monday = getStartOfWeek(date);

    // day of week
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);

        const dateString = d.toISOString().split("T")[0];

        const dayData = transactions.find(t => {
            const tDate = new Date(t.date).toISOString().split("T")[0];
            return tDate === dateString;
        });

        if (dayData) {
            data.push({
                date: days[d.getDay()],
                amount: Number(dayData.amount)
            });
        } else {
            data.push({
                date: days[d.getDay()],
                amount: 0
            });
        }
    }

    const total = data.reduce((sum, val) => sum += val.amount, 0);
    const average = total / 7;
    console.log("total: ", total);

    return successResponse(res, "Fetch weekly transactions successfully", { 
        weeklyData: data, 
        label: account.name, 
        total, 
        average,
        from: getStartOfWeek(date),
        to: getEndOfWeek(date)
    });


});

const getExpenseByCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const account = await Account.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
        return successResponse(res, "Fetch expense by category successfully", []);
    }

    const transactions = await Transaction.findAll({
        where: {
            accountId: id,
            type: "EXPENSE",
        },
        attributes: [
            'categoryId',
            [sequelize.fn("SUM", sequelize.col("amount")), "amount"],
        ],
        include: [{
            model: Category,
            as: 'category',
            attributes: ['name', 'color', 'icon']
        }],
        group: ['categoryId', 'category.id'],
    });

    const data = transactions.map(t => {
        const amount = Number(t.get('amount') || 0);
        return {
            category: t.category ? t.category.name : "Uncategorized",
            amount,
            fill: t.category ? t.category.color : "#cbd5e1" // default color
        }
    });

    return successResponse(res, "Fetch expense by category successfully", data);
});

module.exports = {
    createAccount,
    getAllAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    createTransaction,
    getTransactionByAccountId,
    createSpendingLimit,
    getSpendingLimits,
    updateSpendingLimit,
    deleteSpendingLimit,
    getWeeklyExpense,
    getExpenseByCategory
}
