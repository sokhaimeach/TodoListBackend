'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Account extends Model {
        static associate(models) {
            Account.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Account.hasMany(models.Transaction, { foreignKey: 'accountId', as: 'transactions' });
            Account.hasMany(models.SpendingLimit, { foreignKey: 'accountId', as: 'spendingLimits' });
        }
    }

    Account.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onDelete: 'CASCADE'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        balance: {
            type: DataTypes.DOUBLE,
            defaultValue: 0.0
        },
        currency: {
            type: DataTypes.ENUM('KHR', 'USD'),
            defaultValue: 'KHR'
        }
    }, {
        sequelize,
        modelName: 'Account',
        timestamps: true
    });

    return Account;
};
