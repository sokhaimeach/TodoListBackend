const successResponse = (res, message, data = {}, statusCode = 200, meta = null) => {
    const response = {
        success: true,
        message,
        data
    };
    if (meta) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR", errors = null) => {
    const response = {
        success: false,
        errorCode,
        message
    };
    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    errorResponse
};
