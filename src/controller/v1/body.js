const { getBody64, getUUID } = require("../../helpers/profile");
const { isUUID } = require("../../helpers/uuidv4");
const Numbers = require("../../helpers/numbers");

module.exports.getBody = async (req, res) => {
    const name = req.params.name;
    const uuid = isUUID(name) ? name : await getUUID(name);
    const width = Numbers.getPositive(req.options.width, 160);
    const height = Numbers.getPositive(req.options.height, 320);

    let body64 = await getBody64(uuid, width, height, req.options.overlay);

    // substr to remove MIME type from start
    body64 = body64.substr(body64.indexOf(",") + 1);

    if (req.options.base64) {
        res.send(body64);
        return;
    }

    const body = Buffer.from(body64, "base64");
    res.set("Content-Type", "image/png");
    res.send(body);
};
