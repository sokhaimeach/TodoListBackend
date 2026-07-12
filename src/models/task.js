'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Task extends Model {
        static associate(models) {
            Task.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Task.belongsTo(models.Goal, { foreignKey: 'goalId', as: 'goal' });
        }
    }

    Task.init({
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
        goalId: {
            type: DataTypes.UUID,
            references: { model: 'Goals', key: 'id' },
            onDelete: 'SET NULL'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        status: {
            type: DataTypes.ENUM('TODO', 'IN_PROGRESS', 'DONE', 'MISSED'),
            defaultValue: 'TODO'
        },
        priority: {
            type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
            allowNull: true
        },
        startDate: DataTypes.DATE,
        dueDate: DataTypes.DATE,
        isRecurring: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        completedAt: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Task',
        timestamps: true
    });

    return Task;
};
