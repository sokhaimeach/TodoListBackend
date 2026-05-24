require('dotenv').config();
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const logger = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));
app.use(cors());

// import routes
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const accountRoutes = require('./routes/account.route');
const taskRoutes = require('./routes/task.route');
const goalRoutes = require('./routes/goal.route');
const scheduleRoutes = require('./routes/schedule.route');
const eventRoutes = require('./routes/event.route');
const habitRoutes = require('./routes/habit.route');

// register routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/habits', habitRoutes);

// error handler
app.use(errorHandler);

module.exports = app;
