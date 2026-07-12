'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SpendingLimit extends Model {
        static associate(models) {
            SpendingLimit.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            SpendingLimit.belongsTo(models.Account, { foreignKey: 'accountId', as: 'account' });
        }
    }

    SpendingLimit.init({
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
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Users', key: 'id' },
            onDelete: 'CASCADE'
        },
        period: {
            type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY'),
            allowNull: false
        },
        limitAmount: {
            type: DataTypes.DOUBLE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'SpendingLimit',
        timestamps: true
    });

    return SpendingLimit;
};
