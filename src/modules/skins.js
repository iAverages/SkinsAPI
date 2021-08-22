const axios = require("axios");
const log = require("./logger");
const monk = require("monk")("localhost/skinsapi");
const Jimp = require('jimp');
const { isUUID } = require("./uuidv4");
const mongoSkins = monk.get("skins");
const MinecraftSkin = require('../modules/mess2.js');

const steveDefault = { profileName: 'SteveDefault', textures: { SKIN: { url: 'https://dannn.net/l4lDJeZp' } } }

async function getIfExistsMongo(name) {
    const data = isUUID(name) ? await mongoSkins.find({ uuid: name.replace(/-/g, "") }) : await mongoSkins.find({ name: name });
    return (Object.entries(data).length === 0) ? { success: false } : data[0];
}

async function getSkin(name) {
    let data = null;
    const dataMongo = await getIfExistsMongo(name);

    if (dataMongo.success !== true) {
        const dataMojang = await getDataFromMojang(name);

        if (dataMojang.success == false) {
            log.info(`Unable to find ${name}'s skin, using steve as default.`)
            data = steveDefault;
        } else {
            log.info(`Fetched ${name} from Mojang, will save to Mongo.`)
            data = dataMojang;
        }

        // Get data and save to mongo
        data = await parseMojangProfile(data);
        data.success = true;
        mongoSkins.insert(data);
    } else {
        log.info(`Found ${name} in mongoDB`)
        data = dataMongo;
        checkForUpdates(data);
    }

    return data.skin.skinBase64;
}

async function checkForUpdates(data) {
    if (data.time + 43200000 < Date.now()) {
        log.info(`Updating ${data.name} with new skin`);
        await mongoSkins.findOneAndDelete(data);
        await getSkin(data.name);
    }
}

async function parseMojangProfile(jsonProfile) {
    const name = jsonProfile.profileName;
    const uuid = jsonProfile.profileId;
    const skinURL = jsonProfile.textures.SKIN.url;

    let parsedJson = {};

    parsedJson.time = Date.now();
    parsedJson.skin = {};
    parsedJson.skin.skinURL = skinURL;
    parsedJson.skin.skinBase64 = await getBase64FromURL(skinURL);
    parsedJson.name = name;
    parsedJson.uuid = uuid;

    return parsedJson;
}

async function getHead(name, width = 100, height = 100) {
    const user = await getSkin(name);
    try { // Load base64 image into Jimp for resizing.
        var bottom = await Jimp.read(new Buffer.from(user, "base64"));
        var top = await Jimp.read(new Buffer.from(user, "base64"));
    } catch (e) {
        log.warn(`Unable to crop head for ${name}`);
        return await getBase64FromURL(steveDefault.SKIN.url);
    }
    // Crop the image to only the head.
    bottom.crop(8, 8, 8, 8);
    top.crop(40, 8, 8, 8);
    bottom.composite(top, 0, 0);
    bottom.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR)

    return await bottom.getBase64Async(Jimp.AUTO)
}

async function getDataFromMojang(name) {
    try {
        let userID;
        if (!isUUID(name)) {
            userID = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`)).data.id;
            if (userID == null) return { success: false };
        } else userID = name;

        const userJson = (await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${userID}`)).data;

        if (userJson == null) return { success: false };

        return JSON.parse(new Buffer.from(userJson.properties[0].value, "base64").toString());
    } catch (e) {
        log.error(e);
        return { success: false };
    }
}

async function getBase64FromURL(url) {
    const binary = (await axios.get(url, { responseType: "arraybuffer" })).data;
    return Buffer.from(binary, "binary").toString("base64");
}

async function get3DSkin(name) {
    const skinB64 = await getSkin(name);
    const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
    const skinBuffer = skin.getRender();
    return skinBuffer;
}
async function get3DHead(name) {
    const skinB64 = await getSkin(name);
    const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
    const skinBuffer = skin.getHead();
    return skinBuffer;
}

module.exports = {
    getSkin,
    getHead,
    get3DSkin,
    get3DHead
}