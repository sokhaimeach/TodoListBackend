'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Schedule extends Model {
        static associate(models) {
            Schedule.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    Schedule.init({
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
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        repeatType: {
            type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY')
        },
        repeatDays: DataTypes.STRING,
        startTime: DataTypes.TIME,
        endTime: DataTypes.TIME,
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Schedule',
        timestamps: true
    });

    return Schedule;
};
