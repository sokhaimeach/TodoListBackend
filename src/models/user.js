'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Task, { foreignKey: 'userId', as: 'tasks' });
            User.hasMany(models.Event, { foreignKey: 'userId', as: 'events' });
            User.hasMany(models.Goal, { foreignKey: 'userId', as: 'goals' });
            User.hasMany(models.Account, { foreignKey: 'userId', as: 'accounts' });
            User.hasMany(models.Schedule, { foreignKey: 'userId', as: 'schedules' });
            User.hasMany(models.Category, { foreignKey: 'userId', as: 'categories' });
            User.hasMany(models.SpendingLimit, { foreignKey: 'userId', as: 'spendingLimits' });
            User.hasMany(models.Habit, { foreignKey: 'userId', as: 'habits' });
            User.hasMany(models.UserRefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
        }

        async comparePassword(plainPassword) {
            return bcrypt.compare(plainPassword, this.password);
        }
    }

    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        gender: {
            type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
            defaultValue: 'OTHER'
        },
        age: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'User',
        timestamps: true,
        defaultScope: {
            attributes: { exclude: ['password'] }
        },
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            }
        }
    });

    return User;
};
