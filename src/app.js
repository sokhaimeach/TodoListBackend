require('dotenv').config();
const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const app = express();
const logger = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const compression = require('compression');
const ERROR_CODES = require("./constants/errorCode");

// security headers
app.use(helmet());

// compression
app.use(compression());

// cors options
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173"];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(logger('dev'));

// running cron job (with error guard)
try {
    require("./jobs/taskStatus");
} catch (err) {
    console.error("Failed to start cron job:", err.message);
}

// import routes
const authRoutes = require('./routes/auth.route');
const categoryRoutes = require('./routes/category.route');
const accountRoutes = require('./routes/account.route');
const taskRoutes = require('./routes/task.route');
const goalRoutes = require('./routes/goal.route');
const scheduleRoutes = require('./routes/schedule.route');
const eventRoutes = require('./routes/event.route');
const habitRoutes = require('./routes/habit.route');
const dashboardRoutes = require('./routes/dashboard.route');
const userRoutes = require('./routes/user.route');

// register routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/accounts', accountRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 handler
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        errorCode: ERROR_CODES.NOT_FOUND,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// error handler
app.use(errorHandler);

module.exports = app;
