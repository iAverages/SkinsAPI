const { getCape64, getUUID } = require("../../helpers/profile");
const { isUUID } = require("../../helpers/uuidv4");

module.exports.getCape = async (req, res) => {
    const name = req.params.name;
    const uuid = isUUID(name) ? name : await getUUID(name);
    const cape64 = await getCape64(uuid);

    // If no cape, return empty response.
    if (!cape64) {
        res.status(404).send();
        return;
    }

    if (req.options.base64) {
        res.send(cape64);
        return;
    }
    const body = Buffer.from(cape64, "base64");
    res.set("Content-Type", "image/png");
    res.send(body);
};
