require('dotenv').config();
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const logger = require('morgan');
const cors = require('cors');

app.use(express.json());
app.use(logger('dev'));
app.use(cors());

// import routes
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const accountRoutes = require('./routes/account.route');

// register routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/accounts', accountRoutes);

// error handler
app.use(errorHandler);

module.exports = app;