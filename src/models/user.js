'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Task, {
        foreignKey: 'userId',
        as: 'tasks'
      });

      User.hasMany(models.Event, {
        foreignKey: 'userId',
        as: 'events'
      });

      User.hasMany(models.Goal, {
        foreignKey: 'userId',
        as: 'goals'
      });

      User.hasMany(models.Account, {
        foreignKey: 'userId',
        as: 'accounts'
      });

      User.hasMany(models.Schedule, {
        foreignKey: 'userId',
        as: 'schedules'
      });

      User.hasMany(models.Category, {
        foreignKey: 'userId',
        as: 'categories'
      });

      User.hasMany(models.SpendingLimit, {
        foreignKey: 'userId',
        as: 'spendingLimits'
      });

      User.hasMany(models.Habit, {
        foreignKey: 'userId',
        as: 'habits'
      });

      User.hasMany(models.UserRefreshToken, {
        foreignKey: 'userId',
        as: 'refreshTokens'
      });
    }

    // method to compare password
    async comparePassword(plainPassword) {
      return bcrypt.compare(plainPassword, this.password);
    };
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    gender: {
      type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
      defaultValue: 'OTHER'
    },
    age: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    // scrop
    defaultScope: {
      attributes: { exclude: ['password'] }
    },

    // hash password before create and update
    hooks: {
      // create
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },

      // update
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });
  return User;
};
