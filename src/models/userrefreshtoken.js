'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserRefreshToken extends Model {
        static associate(models) {
            UserRefreshToken.belongsTo(models.User, {
                foreignKey: 'userId',
                as: 'user'
            });
        }
    }

    UserRefreshToken.init({
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
        hashToken: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'UserRefreshToken',
        timestamps: false,
        indexes: [
            { fields: ['hashToken'] },
            { fields: ['userId'] }
        ]
    });

    return UserRefreshToken;
};
