'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // add NOT NULL and UNIQUE to Users.username
        await queryInterface.changeColumn('Users', 'username', {
            type: Sequelize.STRING,
            allowNull: false
        });
        await queryInterface.addConstraint('Users', {
            fields: ['username'],
            type: 'unique',
            name: 'unique_users_username'
        });

        // add NOT NULL and UNIQUE to Users.email
        await queryInterface.changeColumn('Users', 'email', {
            type: Sequelize.STRING,
            allowNull: false
        });
        await queryInterface.addConstraint('Users', {
            fields: ['email'],
            type: 'unique',
            name: 'unique_users_email'
        });

        // add NOT NULL to Tasks.title
        await queryInterface.changeColumn('Tasks', 'title', {
            type: Sequelize.STRING,
            allowNull: false
        });

        // add NOT NULL to Goals.title
        await queryInterface.changeColumn('Goals', 'title', {
            type: Sequelize.STRING,
            allowNull: false
        });

        // add NOT NULL to Categories.name
        await queryInterface.changeColumn('Categories', 'name', {
            type: Sequelize.STRING,
            allowNull: false
        });

        // add unique constraint on (userId, name) for Categories
        await queryInterface.addConstraint('Categories', {
            fields: ['userId', 'name'],
            type: 'unique',
            name: 'unique_user_category_name'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeConstraint('Users', 'unique_users_username');
        await queryInterface.removeConstraint('Users', 'unique_users_email');
        await queryInterface.removeConstraint('Categories', 'unique_user_category_name');

        await queryInterface.changeColumn('Users', 'username', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.changeColumn('Users', 'email', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.changeColumn('Tasks', 'title', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.changeColumn('Goals', 'title', { type: Sequelize.STRING, allowNull: true });
        await queryInterface.changeColumn('Categories', 'name', { type: Sequelize.STRING, allowNull: true });
    }
};
