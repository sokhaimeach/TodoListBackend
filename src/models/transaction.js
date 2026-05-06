'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transaction.belongsTo(models.Account, {
        foreignKey: 'accountId',
        as: 'account'
      });

      Transaction.belongsTo(models.Task, {
        foreignKey: 'taskId',
        as: 'task'
      });

      Transaction.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });
    }
  }
  Transaction.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Accounts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    taskId: {
      type: DataTypes.UUID,
      references: {
        model: 'Tasks',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    categoryId: {
      type: DataTypes.UUID,
      references: {
        model: 'Categories',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    currency: {
      type: DataTypes.ENUM('KHR', 'USD')
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('INCOME', 'EXPENSE'),
      allowNull: false
    },
    date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Transaction',
    timestamps: true
  });
  return Transaction;
};