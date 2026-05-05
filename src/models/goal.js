'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Goal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Goal.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Goal.hasMany(models.Task, {
        foreignKey: 'goalId',
        as: 'tasks'
      });
    }
  }
  Goal.init({
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    startDate: DataTypes.DATE,
    deadline: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ACHIEVED', 'ABANDONED'),
      defaultValue: 'ACTIVE'
    },
    targetAmount: DataTypes.DOUBLE,
    currentAmount: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Goal',
    timestamps: true
  });
  return Goal;
};