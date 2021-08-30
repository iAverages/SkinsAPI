const { getSkin64, getUUID } = require("../../helpers/profile");
const { isUUID } = require("../../helpers/uuidv4");

module.exports.getSkin = async (req, res) => {
    const name = req.params.name;
    const uuid = isUUID(name) ? name : await getUUID(name);
    const skin64 = await getSkin64(uuid);
    if (req.options.base64) {
        res.send(skin64);
        return;
    }
    const skin = Buffer.from(skin64, "base64");
    res.set("Content-Type", "image/png");
    res.send(skin);
};
