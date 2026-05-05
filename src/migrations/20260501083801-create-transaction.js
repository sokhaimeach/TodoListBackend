'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      accountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Accounts',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      taskId: {
        type: Sequelize.UUID,
        references: {
          model: 'Tasks',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      categoryId: {
        type: Sequelize.UUID,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      description: {
        type: Sequelize.TEXT
      },
      currency: {
        type: Sequelize.ENUM('KHR', 'USD')
      },
      amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('INCOME', 'EXPENSE'),
        allowNull: false
      },
      date: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};