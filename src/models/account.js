'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Account.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Account.hasMany(models.Transaction, {
        foreignKey: 'accountId',
        as: 'transactions'
      });

      Account.hasMany(models.SpendingLimit, {
        foreignKey: 'accountId',
        as: 'spendingLimits'
      });
    }
  }
  Account.init({
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: DataTypes.STRING,
    balance: DataTypes.DOUBLE,
    currency: {
      type: DataTypes.ENUM('KHR', 'USD'),
      defaultValue: 'KHR'
    },
  }, {
    sequelize,
    modelName: 'Account',
    timestamps: true
  });
  return Account;
};