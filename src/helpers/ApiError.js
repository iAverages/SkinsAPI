module.exports = class ApiError extends Error {
    status;

    constructor(status, message, stack) {
        super(message);
        this.status = status;
        // Add or capture stack trace
        if (stack) this.stack = stack;
        else Error.captureStackTrace(this, this.constructor);
    }
};
