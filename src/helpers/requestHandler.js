const format = (res, status = 200, message, data) => {
    // Construct the return json
    const json = { success: status < 400 };
    if (message) json.message = message;
    if (data) json.data = data;
    res.status(status).json(json);
};

module.exports.success = (res, message = "", data) => {
    format(res, 200, message, data);
};

module.exports.error = (res, message = "", data) => {
    format(res, 500, message, data);
};

module.exports.badRequest = (res, message = "", data) => {
    format(res, 400, message, data);
};

module.exports.notFound = (res, message = "404 Not Found", data) => {
    format(res, 404, message, data);
};

module.exports.custom = (res, status, message = "", data) => {
    format(res, status, message, data);
};

module.exports.customError = (res, { status, message }) => {
    format(res, status, message);
};
