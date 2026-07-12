'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Event extends Model {
        static associate(models) {
            Event.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    Event.init({
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
        description: DataTypes.TEXT,
        startDate: DataTypes.DATE,
        endDate: DataTypes.DATE,
        reminder: DataTypes.STRING,
        color: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Event',
        timestamps: true
    });

    return Event;
};
