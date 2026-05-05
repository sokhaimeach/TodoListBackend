'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HabitLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      HabitLog.belongsTo(models.Habit, {
        foreignKey: 'habitId',
        as: 'habit'
      });
    }
  }
  HabitLog.init({
    habitId: {
      type: DataTypes.UUID,
      references: {
        model: 'Habits',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    date: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('DONE', 'SKIPPED', 'MISSED'),
      defaultValue: null
    },
  }, {
    sequelize,
    modelName: 'HabitLog',
    timestamps: true
  });
  return HabitLog;
};