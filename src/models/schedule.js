'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Schedule.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Schedule.hasMany(models.Task, {
        foreignKey: 'scheduleId',
        as: 'tasks'
      });
    }
  }
  Schedule.init({
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: DataTypes.STRING,
    repeatType: {
      type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY')
    },
    repeatDays: DataTypes.TIME,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Schedule',
    timestamps: true
  });
  return Schedule;
};