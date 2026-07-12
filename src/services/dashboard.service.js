const { Op, fn, col, literal } = require('sequelize');
const {
    Task, Event, Goal, Habit, HabitLog, Account,
    Transaction, Schedule, sequelize
} = require('../models');

const getTodaySummary = async (userId) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const todayTasks = await Task.count({
        where: { userId, startDate: { [Op.gte]: startOfDay, [Op.lt]: endOfDay } }
    });

    const todayEvents = await Event.count({
        where: { userId, startDate: { [Op.gte]: startOfDay, [Op.lt]: endOfDay } }
    });

    const todaySchedules = await Schedule.count({
        where: { userId, isActive: true }
    });

    return { tasks: todayTasks, events: todayEvents, schedules: todaySchedules };
};

const getOverdueItems = async (userId) => {
    const now = new Date();

    const overdueTasks = await Task.count({
        where: {
            userId,
            dueDate: { [Op.lt]: now },
            status: { [Op.in]: ['TODO', 'IN_PROGRESS'] }
        }
    });

    const overdueGoals = await Goal.count({
        where: {
            userId,
            deadline: { [Op.lt]: now },
            status: 'ACTIVE'
        }
    });

    return { tasks: overdueTasks, goals: overdueGoals };
};

const getTaskStats = async (userId) => {
    const total = await Task.count({ where: { userId } });
    const completed = await Task.count({ where: { userId, status: 'DONE' } });
    const inProgress = await Task.count({ where: { userId, status: 'IN_PROGRESS' } });
    const missed = await Task.count({ where: { userId, status: 'MISSED' } });
    const todo = await Task.count({ where: { userId, status: 'TODO' } });

    return {
        total, completed, inProgress, missed, todo,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
};

const getGoalProgress = async (userId) => {
    const goals = await Goal.findAll({ where: { userId } });
    const total = goals.length;
    const achieved = goals.filter(g => g.status === 'ACHIEVED').length;
    const active = goals.filter(g => g.status === 'ACTIVE').length;

    const averageProgress = goals
        .filter(g => g.targetValue > 0)
        .reduce((sum, g) => sum + Math.min(g.currentValue / g.targetValue * 100, 100), 0);

    return {
        total,
        achieved,
        active,
        abandoned: goals.filter(g => g.status === 'ABANDONED').length,
        averageProgress: active > 0 ? Math.round(averageProgress / active) : 0
    };
};

const getHabitStats = async (userId) => {
    const habits = await Habit.findAll({ where: { userId, isActive: true } });
    const totalHabits = habits.length;
    const maxStreak = habits.reduce((max, h) => Math.max(max, h.streakCount || 0), 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const doneToday = await HabitLog.count({
        where: {
            date: todayStr,
            status: 'DONE'
        },
        include: [{
            model: Habit,
            as: 'habit',
            where: { userId, isActive: true },
            attributes: []
        }]
    });

    return {
        total: totalHabits,
        doneToday,
        maxStreak,
        needToDo: totalHabits - doneToday
    };
};

const getFinanceSummary = async (userId) => {
    const accounts = await Account.findAll({ where: { userId } });

    let totalBalance = 0;
    const accountSummaries = [];

    for (const account of accounts) {
        const income = await Transaction.sum('amount', {
            where: { accountId: account.id, type: 'INCOME' }
        }) || 0;

        const expense = await Transaction.sum('amount', {
            where: { accountId: account.id, type: 'EXPENSE' }
        }) || 0;

        totalBalance += account.balance;
        accountSummaries.push({
            id: account.id,
            name: account.name,
            currency: account.currency,
            balance: account.balance,
            totalIncome: income,
            totalExpense: expense
        });
    }

    return {
        totalBalance,
        accountCount: accounts.length,
        accounts: accountSummaries
    };
};

const getMonthlyStats = async (userId) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // tasks created this month
    const tasksCreated = await Task.count({
        where: { userId, createdAt: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth } }
    });

    const tasksCompleted = await Task.count({
        where: { userId, completedAt: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth } }
    });

    // monthly finance
    const monthlyIncome = await Transaction.sum('amount', {
        where: {
            date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth },
            type: 'INCOME'
        },
        include: [{
            model: Account,
            as: 'account',
            where: { userId },
            attributes: []
        }]
    }) || 0;

    const monthlyExpense = await Transaction.sum('amount', {
        where: {
            date: { [Op.gte]: startOfMonth, [Op.lt]: startOfNextMonth },
            type: 'EXPENSE'
        },
        include: [{
            model: Account,
            as: 'account',
            where: { userId },
            attributes: []
        }]
    }) || 0;

    // habit completion this month
    const totalHabitLogs = await HabitLog.count({
        where: {
            date: { [Op.gte]: startOfMonth.toISOString().split('T')[0], [Op.lt]: startOfNextMonth.toISOString().split('T')[0] }
        },
        include: [{
            model: Habit,
            as: 'habit',
            where: { userId },
            attributes: []
        }]
    });

    const doneHabitLogs = await HabitLog.count({
        where: {
            date: { [Op.gte]: startOfMonth.toISOString().split('T')[0], [Op.lt]: startOfNextMonth.toISOString().split('T')[0] },
            status: 'DONE'
        },
        include: [{
            model: Habit,
            as: 'habit',
            where: { userId },
            attributes: []
        }]
    });

    return {
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        tasks: { created: tasksCreated, completed: tasksCompleted },
        finance: { income: monthlyIncome, expense: monthlyExpense, net: monthlyIncome - monthlyExpense },
        habits: { total: totalHabitLogs, done: doneHabitLogs, rate: totalHabitLogs > 0 ? Math.round((doneHabitLogs / totalHabitLogs) * 100) : 0 }
    };
};

const getWeeklyTaskCompletion = async (userId) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const tasks = await Task.findAll({
        where: {
            userId,
            [Op.or]: [
                { startDate: { [Op.between]: [monday, sunday] } },
                { completedAt: { [Op.between]: [monday, sunday] } }
            ]
        },
        attributes: [
            [fn('DATE', col('startDate')), 'date'],
            [fn('COUNT', col('id')), 'total'],
            [fn('SUM', literal("CASE WHEN status = 'DONE' THEN 1 ELSE 0 END")), 'completed']
        ],
        group: [fn('DATE', col('startDate'))],
        order: [[fn('DATE', col('startDate')), 'ASC']]
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weeklyData = days.map((day, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayStats = tasks.find(t => {
            const tDate = t.get('date');
            return tDate && new Date(tDate).toISOString().split('T')[0] === dateStr;
        });
        return {
            day,
            total: dayStats ? Number(dayStats.get('total')) : 0,
            completed: dayStats ? Number(dayStats.get('completed')) : 0
        };
    });

    return weeklyData;
};

module.exports = {
    getTodaySummary,
    getOverdueItems,
    getTaskStats,
    getGoalProgress,
    getHabitStats,
    getFinanceSummary,
    getMonthlyStats,
    getWeeklyTaskCompletion
};
