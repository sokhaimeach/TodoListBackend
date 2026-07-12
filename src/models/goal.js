'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Goal extends Model {
        static associate(models) {
            Goal.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Goal.hasMany(models.Task, { foreignKey: 'goalId', as: 'tasks' });
            Goal.hasMany(models.GoalProgress, { foreignKey: 'goalId', as: 'progress' });
        }
    }

    Goal.init({
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
        type: {
            type: DataTypes.ENUM("FINANCE", "EDUCATION", "HEALTH", "CAREER", "PERSONAL", "FITNESS"),
            allowNull: false,
            defaultValue: "PERSONAL"
        },
        description: DataTypes.TEXT,
        startDate: DataTypes.DATE,
        deadline: DataTypes.DATE,
        status: {
            type: DataTypes.ENUM('ACTIVE', 'ACHIEVED', 'ABANDONED'),
            defaultValue: 'ACTIVE'
        },
        targetValue: DataTypes.DOUBLE,
        currentValue: {
            type: DataTypes.DOUBLE,
            defaultValue: 0.0
        },
        unit: {
            type: DataTypes.STRING,
            defaultValue: null
        }
    }, {
        sequelize,
        modelName: 'Goal',
        timestamps: true
    });

    return Goal;
};
