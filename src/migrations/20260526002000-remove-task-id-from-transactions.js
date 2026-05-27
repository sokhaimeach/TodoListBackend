'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('Transactions');

    if (!table.taskId) {
      return;
    }

    await queryInterface.removeColumn('Transactions', 'taskId');
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Transactions');

    if (table.taskId) {
      return;
    }

    await queryInterface.addColumn('Transactions', 'taskId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Tasks',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
  }
};
