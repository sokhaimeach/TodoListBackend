'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Habit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Habit.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Habit.hasMany(models.HabitLog, {
        foreignKey: 'habitId',
        as: 'logs'
      });
    }
  }
  Habit.init({
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
    title: DataTypes.STRING,
    frequencyType: {
      type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY')
    },
    frequencyDays: DataTypes.STRING,
    frequencyCount: DataTypes.BIGINT,
    targetTime: DataTypes.DATE,
    streakCount: DataTypes.BIGINT,
    lastDoneAt: DataTypes.DATE,
    startDate: DataTypes.DATE,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Habit',
    timestamps: true
  });
  return Habit;
};