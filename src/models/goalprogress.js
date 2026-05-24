'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GoalProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      GoalProgress.belongsTo(models.Goal, {
        foreignKey: 'goalId',
        as: 'goal'
      });
    }
  }
  GoalProgress.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    goalId: {
      type: DataTypes.UUID,
      references: {
        model: 'Goals',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: DataTypes.ENUM('DONE', 'MISSED'),
    value: {
      type: DataTypes.DOUBLE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'GoalProgress',
    timestamps: true
  });
  return GoalProgress;
};
