const { Op } = require('sequelize');
const ERROR_CODES = require('../constants/errorCode');
const { INCOME, EXPENSE } = require('../constants/type');
const { asyncHandler } = require('../middlewares/asyncHandler');
const { Account, Transaction, SpendingLimit, Category, sequelize } = require('../models');
const AppError = require('../utils/AppError');
const { getStartOfWeek, getEndOfWeek, toLocalDateStr } = require('../utils/formatDate');
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

// update account (name, currency only — balance not directly updateable)
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
// can delete only if no transaction or spending limit exists
const deleteAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const account = await Account.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    const hasTransaction = await Transaction.count({ where: { accountId: id } });
    if (hasTransaction > 0) {
        throw new AppError(ERROR_CODES.EXIST, "Cannot delete account with transaction history", 409);
    }

    const hasLimit = await SpendingLimit.count({ where: { accountId: id } });
    if (hasLimit > 0) {
        throw new AppError(ERROR_CODES.EXIST, "Cannot delete account with spending limit", 409);
    }

    await account.destroy();

    return successResponse(res, "Delete account successfully");
});

// recalculate account balance from all transactions
const recalculateBalance = async (accountId, transaction) => {
    const result = await Transaction.findAll({
        where: { accountId },
        attributes: [
            'type',
            [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['type'],
        transaction
    });

    let balance = 0;
    for (const row of result) {
        const total = Number(row.get('total') || 0);
        if (row.type === INCOME) {
            balance += total;
        } else {
            balance -= total;
        }
    }

    await Account.update({ balance }, { where: { id: accountId }, transaction });
    return balance;
};

// create transaction
const createTransaction = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { type, accountId, categoryId, amount } = req.body;

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

        if (type === EXPENSE && account.balance < amount) {
            throw new AppError(ERROR_CODES.BAD_REQUEST, "Insufficient balance", 400);
        }

        const transaction = await Transaction.create(req.body, { transaction: t });

        // recalculate balance from all transactions for accuracy
        await recalculateBalance(accountId, t);

        await t.commit();
        return successResponse(res, "Create transaction successfully", transaction, 201);
    } catch (err) {
        await t.rollback();
        throw err;
    }
});

// update transaction
const updateTransaction = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const transaction = await Transaction.findOne({
            where: { id: req.params.id },
            include: [{
                model: Account,
                as: 'account',
                where: { userId: req.user.id },
                attributes: ['id']
            }],
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (!transaction) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Transaction not found", 404);
        }

        if (req.body.categoryId) {
            const category = await Category.findOne({
                where: { id: req.body.categoryId, userId: req.user.id },
                transaction: t
            });
            if (!category) {
                throw new AppError(ERROR_CODES.NOT_FOUND, "Category not found", 404);
            }
        }

        await transaction.update(req.body, { transaction: t });

        // recalculate balance
        await recalculateBalance(transaction.accountId, t);

        await t.commit();
        return successResponse(res, "Update transaction successfully", transaction);
    } catch (err) {
        await t.rollback();
        throw err;
    }
});

// delete transaction
const deleteTransaction = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const transaction = await Transaction.findOne({
            where: { id: req.params.id },
            include: [{
                model: Account,
                as: 'account',
                where: { userId: req.user.id },
                attributes: ['id']
            }],
            transaction: t
        });

        if (!transaction) {
            throw new AppError(ERROR_CODES.NOT_FOUND, "Transaction not found", 404);
        }

        await transaction.destroy({ transaction: t });

        // recalculate balance after deletion
        await recalculateBalance(transaction.accountId, t);

        await t.commit();
        return successResponse(res, "Delete transaction successfully", transaction);
    } catch (err) {
        await t.rollback();
        throw err;
    }
});

// get transaction by account id — grouped by date for a given week
const getTransactionByAccountId = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date: queryDate } = req.query;

    const account = await Account.findOne({ where: { id, userId: req.user.id } });
    if (!account) {
        throw new AppError(ERROR_CODES.NOT_FOUND, "Account not found", 404);
    }

    // Calculate week boundaries (Monday – Sunday)
    const refDate = queryDate ? new Date(queryDate) : new Date();
    const dayOfWeek = refDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStart = new Date(refDate);
    weekStart.setDate(refDate.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const transactions = await Transaction.findAll({
        where: {
            accountId: id,
            createdAt: { [Op.between]: [weekStart, weekEnd] }
        },
        order: [["createdAt", "DESC"]]
    });

    // Group by date
    const grouped = {};
    for (const tx of transactions) {
        const dayKey = toLocalDateStr(tx.createdAt);
        if (!grouped[dayKey]) {
            grouped[dayKey] = { date: dayKey, transactions: [], totalIncome: 0, totalExpense: 0 };
        }
        if (tx.type === 'INCOME') {
            grouped[dayKey].totalIncome += tx.amount;
        } else {
            grouped[dayKey].totalExpense += tx.amount;
        }
        grouped[dayKey].transactions.push(tx);
    }

    // Days in DESC order (Sunday → Saturday → … → Monday)
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const key = toLocalDateStr(d);
        if (grouped[key]) {
            weekDays.push(grouped[key]);
        } else {
            weekDays.push({ date: key, transactions: [], totalIncome: 0, totalExpense: 0 });
        }
    }

    return successResponse(res, "Fetch transaction by account id successfully", {
        weekStart: toLocalDateStr(weekStart),
        weekEnd: toLocalDateStr(weekEnd),
        days: weekDays
    });
});

// create spending limit for account
const createSpendingLimit = asyncHandler(async (req, res) => {
    const { accountId } = req.body;

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

// get weekly expense for chart
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
            date: {
                [Op.gte]: getStartOfWeek(date),
                [Op.lte]: getEndOfWeek(date),
            },
        },
        attributes: [
            [sequelize.fn("DATE", sequelize.col("date")), "day"],
            [sequelize.fn("SUM", sequelize.col("amount")), "amount"],
        ],
        group: [sequelize.fn("DATE", sequelize.col("date"))],
        order: [[sequelize.fn("DATE", sequelize.col("date")), "ASC"]],
    });

    const data = [];
    const monday = getStartOfWeek(date);
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);

        const dateString = toLocalDateStr(d);

        const dayData = transactions.find(t => {
            const dayVal = t.get('day');
            const tDateStr = dayVal instanceof Date ? toLocalDateStr(dayVal) : String(dayVal);
            return tDateStr === dateString;
        });

        data.push({
            date: days[d.getDay()],
            amount: dayData ? Number(dayData.get('amount')) : 0
        });
    }

    const total = data.reduce((sum, val) => sum + val.amount, 0);
    const average = total / 7;

    return successResponse(res, "Fetch weekly transactions successfully", {
        weeklyData: data,
        label: account.name,
        total,
        average,
        from: getStartOfWeek(date),
        to: getEndOfWeek(date)
    });
});

// get expense by category for chart
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

    const data = transactions.map(t => ({
        category: t.category ? t.category.name : "Uncategorized",
        amount: Number(t.get('amount') || 0),
        fill: t.category ? t.category.color : "#cbd5e1"
    }));

    return successResponse(res, "Fetch expense by category successfully", data);
});

module.exports = {
    createAccount,
    getAllAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionByAccountId,
    createSpendingLimit,
    getSpendingLimits,
    updateSpendingLimit,
    deleteSpendingLimit,
    getWeeklyExpense,
    getExpenseByCategory
};
