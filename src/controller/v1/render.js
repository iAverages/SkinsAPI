const { get3DHead, get3DSkin, getUUID } = require("../../helpers/profile");
const { isUUID } = require("../../helpers/uuidv4");

module.exports.get3dHead = async (req, res) => {
    const name = req.params.name;
    const uuid = isUUID(name) ? name : await getUUID(name);

    // Render buffer of 3d render
    const render = await get3DHead(uuid);
    if (req.options.base64) {
        res.send(render.toString("base64"));
        return;
    }
    res.set("Content-Type", "image/png");
    res.send(render);
};

module.exports.get3dBody = async (req, res) => {
    const name = req.params.name;
    const uuid = isUUID(name) ? name : await getUUID(name);

    // Render buffer of 3d render
    const render = await get3DSkin(uuid);
    if (req.options.base64) {
        res.send(render.toString("base64"));
        return;
    }
    res.set("Content-Type", "image/png");
    res.send(render);
};
