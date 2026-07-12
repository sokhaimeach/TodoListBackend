'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // add unique index on (habitId, date) for HabitLogs
        await queryInterface.addIndex('HabitLogs', ['habitId', 'date'], {
            unique: true,
            name: 'unique_habit_log_date'
        });

        // change HabitLogs.date from DATE to DATEONLY
        await queryInterface.changeColumn('HabitLogs', 'date', {
            type: Sequelize.DATEONLY,
            allowNull: false
        });

        // add indexes on foreign keys for performance
        await queryInterface.addIndex('Tasks', ['userId']);
        await queryInterface.addIndex('Tasks', ['goalId']);
        await queryInterface.addIndex('Goals', ['userId']);
        await queryInterface.addIndex('Events', ['userId']);
        await queryInterface.addIndex('Schedules', ['userId']);
        await queryInterface.addIndex('Accounts', ['userId']);
        await queryInterface.addIndex('Categories', ['userId']);
        await queryInterface.addIndex('Transactions', ['accountId']);
        await queryInterface.addIndex('Transactions', ['categoryId']);
        await queryInterface.addIndex('Habits', ['userId']);
        await queryInterface.addIndex('HabitLogs', ['habitId']);
        await queryInterface.addIndex('SpendingLimits', ['userId']);
        await queryInterface.addIndex('SpendingLimits', ['accountId']);
        await queryInterface.addIndex('UserRefreshTokens', ['userId']);
        await queryInterface.addIndex('UserRefreshTokens', ['hashToken']);
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('HabitLogs', 'unique_habit_log_date');
        await queryInterface.removeIndex('Tasks', ['userId']);
        await queryInterface.removeIndex('Tasks', ['goalId']);
        await queryInterface.removeIndex('Goals', ['userId']);
        await queryInterface.removeIndex('Events', ['userId']);
        await queryInterface.removeIndex('Schedules', ['userId']);
        await queryInterface.removeIndex('Accounts', ['userId']);
        await queryInterface.removeIndex('Categories', ['userId']);
        await queryInterface.removeIndex('Transactions', ['accountId']);
        await queryInterface.removeIndex('Transactions', ['categoryId']);
        await queryInterface.removeIndex('Habits', ['userId']);
        await queryInterface.removeIndex('HabitLogs', ['habitId']);
        await queryInterface.removeIndex('SpendingLimits', ['userId']);
        await queryInterface.removeIndex('SpendingLimits', ['accountId']);
        await queryInterface.removeIndex('UserRefreshTokens', ['userId']);
        await queryInterface.removeIndex('UserRefreshTokens', ['hashToken']);
    }
};
