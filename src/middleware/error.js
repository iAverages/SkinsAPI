const log = require("../helpers/logger");
const { steveDefault, renderHead64, renderBody64 } = require("../helpers/profile");
const reqHandler = require("../helpers/requestHandler");
const Numbers = require("../helpers/numbers");
const MinecraftSkin = require("../helpers/3dRender");

// Key is the route, value is the function to run if unknown error occurs on that route
const steveOnErrorRouteHandlers = {
    "/v1/profile": (_, res, error) => res.send(steveDefault),

    "/v1/skin": (_, res, error) => {
        const img = Buffer.from(steveDefault.assets.skin.base64, "base64");
        res.set("Content-Type", "image/png");
        res.send(img);
    },

    "/v1/head": async (req, res, error) => {
        const skin = Buffer.from(steveDefault.assets.skin.base64, "base64");
        const width = Numbers.getPositive(req.options.width, 300);
        const height = Numbers.getPositive(req.options.height, 300);
        let head64 = await renderHead64(skin, width, height, req.options.overlay);
        // substr to remove MIME type from start
        head64 = head64.substr(head64.indexOf(",") + 1);
        res.set("Content-Type", "image/png");
        res.send(Buffer.from(head64, "base64"));
    },

    "/v1/body": async (req, res, error) => {
        const skin = Buffer.from(steveDefault.assets.skin.base64, "base64");
        const width = Numbers.getPositive(req.options.width, 160);
        const height = Numbers.getPositive(req.options.height, 320);
        let body64 = await renderBody64(skin, width, height, req.options.overlay);
        // substr to remove MIME type from start
        body64 = body64.substr(body64.indexOf(",") + 1);
        res.set("Content-Type", "image/png");
        res.send(Buffer.from(body64, "base64"));
    },

    "/v1/cape": (_, res) => res.status(404).send(),

    "/v1/render/head": (req, res, error) => {
        const skinB64 = Buffer.from(steveDefault.assets.skin.base64, "base64");
        const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
        const render = skin.getHead();
        if (req.options.base64) {
            res.send(render.toString("base64"));
            return;
        }
        res.set("Content-Type", "image/png");
        res.send(render);
    },

    "/v1/render/body": (req, res, error) => {
        const skinB64 = Buffer.from(steveDefault.assets.skin.base64, "base64");
        const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
        const render = skin.getRender();
        if (req.options.base64) {
            res.send(render.toString("base64"));
            return;
        }
        res.set("Content-Type", "image/png");
        res.send(render);
    },
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
    handler ? handler(req, res, error) : reqHandler.custom(res, errStatus, errMessage);
};
