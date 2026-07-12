const ERROR_CODES = require("../constants/errorCode");
const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require("sequelize");

const errorHandler = (error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    let statusCode = error.statusCode || 500;
    let errorCode = error.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
    let message = error.message || "Something went wrong";
    let details = error.details || null;

    if (error instanceof ValidationError) {
        statusCode = 400;
        errorCode = ERROR_CODES.VALIDATION_ERROR;
        message = "Validation error";
        details = error.errors.map(e => ({ field: e.path, message: e.message }));
    } else if (error instanceof UniqueConstraintError) {
        statusCode = 409;
        errorCode = ERROR_CODES.CONFLICT;
        const fields = error.errors.map(e => e.path).join(", ");
        message = `${fields} already exists`;
    } else if (error instanceof ForeignKeyConstraintError) {
        statusCode = 409;
        errorCode = ERROR_CODES.CONFLICT;
        message = "Referenced resource not found";
    }

    if (errorCode === ERROR_CODES.VALIDATION_ERROR) {
        return res.status(statusCode).json({
            success: false,
            errorCode,
            message,
            details: details || {}
        });
    }

    const response = {
        success: false,
        errorCode,
        message
    };
    if (details) {
        response.details = details;
    }
    if (process.env.NODE_ENV === "development") {
        response.stack = error.stack;
    }

    return res.status(statusCode).json(response);
};

module.exports = errorHandler;
