'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class GoalProgress extends Model {
        static associate(models) {
            GoalProgress.belongsTo(models.Goal, { foreignKey: 'goalId', as: 'goal' });
        }
    }

    GoalProgress.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        goalId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: { model: 'Goals', key: 'id' },
            onDelete: 'CASCADE'
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        status: DataTypes.ENUM('DONE', 'MISSED'),
        value: {
            type: DataTypes.DOUBLE,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'GoalProgress',
        timestamps: true
    });

    return GoalProgress;
};
