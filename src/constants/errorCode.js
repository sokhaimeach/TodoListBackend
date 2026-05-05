const ERROR_CODES = {

    // auth
    INVALID_CREDENTIALS:
        "INVALID_CREDENTIALS",

    TOKEN_EXPIRED:
        "TOKEN_EXPIRED",

    UNAUTHORIZED:
        "UNAUTHORIZED",

    FORBIDDEN:
        "FORBIDDEN",

    // user
    USER_NOT_FOUND:
        "USER_NOT_FOUND",

    EMAIL_ALREADY_EXISTS:
        "EMAIL_ALREADY_EXISTS",

    // validation
    VALIDATION_ERROR:
        "VALIDATION_ERROR",

    // server
    INTERNAL_SERVER_ERROR:
        "INTERNAL_SERVER_ERROR"
};

module.exports = ERROR_CODES;