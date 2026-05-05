'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Habits', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING
      },
      frequencyType: {
        type: Sequelize.ENUM('DAILY', 'WEEKLY', 'MONTHLY')
      },
      frequencyDays: {
        type: Sequelize.STRING
      },
      frequencyCount: {
        type: Sequelize.BIGINT
      },
      targetTime: {
        type: Sequelize.DATE
      },
      streakCount: {
        type: Sequelize.BIGINT
      },
      lastDoneAt: {
        type: Sequelize.DATE
      },
      startDate: {
        type: Sequelize.DATE
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable('Habits');
  }
};