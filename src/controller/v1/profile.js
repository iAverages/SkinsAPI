const { getProfile, getUUID } = require("../../helpers/profile");
const { isUUID } = require("../../helpers/uuidv4");

module.exports.profile = async (req, res) => {
    console.log(req.options);
    const name = req.params.name;
    const uuid = isUUID(name) ? name : await getUUID(name);
    const profile = await getProfile(uuid);
    res.send(profile);
};
