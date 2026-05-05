require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgre',
    database: process.env.DB_DATABASE || 'TodoListDB',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'postgres'
  },
  test: {
    username: process.env.DB_USERNAME_TEST || 'root',
    password: process.env.DB_PASSWORD_TEST || null,
    database: process.env.DB_DATABASE_TEST || 'database_test',
    host: process.env.DB_HOST_TEST || '127.0.0.1',
    dialect: process.env.DB_DIALECT_TEST || 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME_PROD || 'root',
    password: process.env.DB_PASSWORD_PROD || null,
    database: process.env.DB_DATABASE_PROD || 'database_production',
    host: process.env.DB_HOST_PROD || '127.0.0.1',
    dialect: process.env.DB_DIALECT_PROD || 'mysql'
  }
};
