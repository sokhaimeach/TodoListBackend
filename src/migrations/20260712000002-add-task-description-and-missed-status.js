'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // add description column to Tasks
        const taskTable = await queryInterface.describeTable('Tasks');
        if (!taskTable.description) {
            await queryInterface.addColumn('Tasks', 'description', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }

        // rename completeAt to completedAt in Tasks
        if (taskTable.completeAt && !taskTable.completedAt) {
            await queryInterface.renameColumn('Tasks', 'completeAt', 'completedAt');
        }

        // add MISSED to Tasks status enum
        await queryInterface.sequelize.query(
            "ALTER TYPE \"enum_Tasks_status\" ADD VALUE IF NOT EXISTS 'MISSED'"
        );

        // add description column to Events
        const eventTable = await queryInterface.describeTable('Events');
        if (!eventTable.description) {
            await queryInterface.addColumn('Events', 'description', {
                type: Sequelize.TEXT,
                allowNull: true
            });
        }
    },

    async down(queryInterface, Sequelize) {
        const taskTable = await queryInterface.describeTable('Tasks');
        if (taskTable.description) {
            await queryInterface.removeColumn('Tasks', 'description');
        }
        if (taskTable.completedAt) {
            await queryInterface.renameColumn('Tasks', 'completedAt', 'completeAt');
        }
        const eventTable = await queryInterface.describeTable('Events');
        if (eventTable.description) {
            await queryInterface.removeColumn('Events', 'description');
        }
    }
};
