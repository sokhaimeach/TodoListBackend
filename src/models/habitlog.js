'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class HabitLog extends Model {
        static associate(models) {
            HabitLog.belongsTo(models.Habit, { foreignKey: 'habitId', as: 'habit' });
        }
    }

    HabitLog.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        habitId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Habits', key: 'id' },
            onDelete: 'CASCADE'
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('DONE', 'SKIPPED', 'MISSED'),
            defaultValue: null
        }
    }, {
        sequelize,
        modelName: 'HabitLog',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['habitId', 'date'] }
        ]
    });

    return HabitLog;
};
