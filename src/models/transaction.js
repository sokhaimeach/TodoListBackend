'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
            Transaction.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
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
            references: { model: 'Accounts', key: 'id' },
            onDelete: 'CASCADE'
        },
        categoryId: {
            type: DataTypes.UUID,
            references: { model: 'Categories', key: 'id' },
            onDelete: 'SET NULL'
        },
        description: DataTypes.TEXT,
        currency: {
            type: DataTypes.ENUM('KHR', 'USD'),
            allowNull: false
        },
        amount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('INCOME', 'EXPENSE'),
            allowNull: false
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        timestamps: true
    });

    return Transaction;
};
