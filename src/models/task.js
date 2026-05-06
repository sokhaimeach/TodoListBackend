'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Task.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Task.belongsTo(models.Goal, {
        foreignKey: 'goalId',
        as: 'goal'
      });

      Task.belongsTo(models.Schedule, {
        foreignKey: 'scheduleId',
        as: 'schedule'
      });

      Task.hasMany(models.Transaction, {
        foreignKey: 'taskId',
        as: 'transactions'
      });
    }
  }
  Task.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    goalId: {
      type: DataTypes.UUID,
      references: {
        model: 'Goals',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    scheduleId: {
      type: DataTypes.UUID,
      references: {
        model: 'Schedules',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    title: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE'),
      defaultValue: 'TODO'
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
      allowNull: true
    },
    startDate: DataTypes.DATE,
    dueDate: DataTypes.DATE,
    isRecurring: DataTypes.BOOLEAN,
    completeAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Task',
    timestamps: true
  });
  return Task;
};