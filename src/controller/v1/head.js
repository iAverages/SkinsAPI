const { getHead64, getUUID } = require("../../helpers/profile");
const { isUUID } = require("../../helpers/uuidv4");

module.exports.getHead = async (req, res) => {
    const name = req.params.name;
    const uuid = isUUID(name) ? name : await getUUID(name);
    let head64 = await getHead64(uuid, req.options.width, req.options.height, req.options.overlay);

    // substr to remove MIME type from start
    head64 = head64.substr(head64.indexOf(",") + 1);

    if (req.options.base64) {
        res.send(head64);
        return;
    }

    const head = Buffer.from(head64, "base64");

    res.set("Content-Type", "image/png");
    res.send(head);
};
