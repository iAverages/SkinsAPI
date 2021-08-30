const log = require("../helpers/logger");
const { steveDefault } = require("../helpers/profile");
const reqHandler = require("../helpers/requestHandler");

// Key is the route, value is the function to run if unknown error occurs on that route
const steveOnErrorRouteHandlers = {
    "/v1/profile": (res, error) => res.status(error.status ? error.status : 500).send(steveDefault),
    "/v1/skin": (res, error) => {
        const img = Buffer.from(steveDefault.assets.skin.base64, "base64");
        res.set("Content-Type", "image/png");
        res.status(error.status ? error.status : 500);
        res.send(img);
    },
    // "/v1/head": () => {},
    // "/v1/body": () => {},
    // "/v1/bust": () => {},
    // "/v1/cape": () => {},
};

module.exports = (error, req, res, __) => {
    // Used to determine if the current path should always have steve returned on errors
    // try catch, if [0] is undefined. [1] would error otherwise
    let handler;
    try {
        handler = Object.entries(steveOnErrorRouteHandlers).filter(([path]) => req.path.startsWith(path))[0][1];
    } catch (e) {}

    let errMessage = error.message;
    let errStatus = error.status;
    // Normal error, not custom ApiError. Meaning it was a server
    // error that wasn't handled by the controller
    if (!error.status) {
        errStatus = 500;
        error.stack ? log.error(error.stack) : log.error(error);
        errMessage = "An unknown error occurred.";
    }

    res.set("X-Error", errMessage);
    handler ? handler(res, error) : reqHandler.custom(res, errStatus, errMessage);
};
