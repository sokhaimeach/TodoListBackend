'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Category extends Model {
        static associate(models) {
            Category.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            Category.hasMany(models.Transaction, { foreignKey: 'categoryId', as: 'transactions' });
        }
    }

    Category.init({
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
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        icon: DataTypes.STRING,
        color: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Category',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['userId', 'name'] }
        ]
    });

    return Category;
};
