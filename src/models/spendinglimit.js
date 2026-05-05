'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SpendingLimit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SpendingLimit.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      SpendingLimit.belongsTo(models.Account, {
        foreignKey: 'accountId',
        as: 'account'
      });
    }
  }
  SpendingLimit.init({
    accountId: {
      type: DataTypes.UUID,
      references: {
        model: 'Accounts',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    period: {
      type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY')
    },
    limitAmount: DataTypes.DOUBLE,
    spentAmount: DataTypes.DOUBLE,
    resetAt: DataTypes.DATE,
    isExceeded: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'SpendingLimit',
    timestamps: true
  });
  return SpendingLimit;
};