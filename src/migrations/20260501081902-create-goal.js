'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Goals', {
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
      type: {
        type: Sequelize.ENUM("FINANCE", "EDUCATION", "HEALTH", "CAREER", "PERSONAL", "FITNESS"),
        allowNull: false,
        defaultValue: "PERSONAL"
      },
      description: {
        type: Sequelize.TEXT
      },
      startDate: {
        type: Sequelize.DATE
      },
      deadline: {
        type: Sequelize.DATE
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'ACHIEVED', 'ABANDONED'),
        defaultValue: 'ACTIVE'
      },
      targetValue: Sequelize.DOUBLE,
      currentValue: {
        type: Sequelize.DOUBLE,
        defaultValue: 0.0
      },
      unit: {
        type: Sequelize.STRING,
        defaultValue: null
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
    await queryInterface.dropTable('Goals');
  }
};