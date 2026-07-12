'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Habit extends Model {
        static associate(models) {
            Habit.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Habit.hasMany(models.HabitLog, { foreignKey: 'habitId', as: 'logs' });
        }
    }

    Habit.init({
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
        frequencyType: {
            type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY')
        },
        frequencyDays: DataTypes.STRING,
        frequencyCount: DataTypes.INTEGER,
        targetTime: DataTypes.DATE,
        streakCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lastDoneAt: DataTypes.DATE,
        startDate: DataTypes.DATE,
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Habit',
        timestamps: true
    });

    return Habit;
};
