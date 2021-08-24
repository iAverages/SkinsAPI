const axios = require("axios");
const log = require("./logger");
const Jimp = require("jimp");
const ApiError = require("./ApiError");
const { isUUID } = require("./uuidv4");
const ProfileDB = require("../database/schema/profile");

const mojangApi = "https://api.mojang.com/users/profiles/minecraft/";
const sessionApi = "https://sessionserver.mojang.com/session/minecraft/profile/";

const steveDefault = {
    time: 0,
    uuid: "c06f89064c8a49119c29ea1dbd1aab82",
    name: "MHF_Steve",
    assets: {
        skin: {
            url: "http://textures.minecraft.net/texture/1a4af718455d4aab528e7a61f86fa25e6a369d1768dcb13f7df319a713eb810b",
            base64: "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAFhElEQVR4Xu1a328UVRjdR6UUKJFIKL90oa4Vs1TwgRItUvlljMYSjVIDBAzUloZkg5pIDFWJUE3UpyaQiokJSWM0PPjrwcAjT/2fPufc2TN++82dGcruTrfbOcnJ3L33u7f3nPvd2dm5LZUyMLitV8Bdm59wV5bBHRt65JNj1VTa8VYcKLi6Y72jNgCEyMlDe+Wbk/ujK9hVBlD8wJY1iQaUy+UGoq4rDODq223Auq43QItFBoB6O6wKA3ziswwYqwx0jwEU/vzWta6Mu781wMeuMYDCNZkZ+ivPRztex6HSv0ZAiHquv8eJfam8QV7cGbK6s1de2B7eBypbe9yNELGogwGMQx/0xRho57g0Kuk5ws4nd2gDwD3b1zkhELhvV5+7kvh8eHCjjAxucnEwhDHogzqOow1Ie46w88kdbtKbw1ULhQfC+rHS/Nwrf89ekvvf1+Th3Izc/64WlK/Ib5+ekv27N7oYxKIP+kbbJRgTY0Nw2nOEnU/ucCu1JUjlbevCVe0PtwLK1Wf75NcvLsif16fd9feZaZmvfSj/ztZk/uM3HRGDWPRBX5QxFsbE56znCDuf3MFUDbfBWik//aTceH9Y5s8fkeHKU048MPbKrPx19aITjzIAUxCDWPRBX4yhx9RiuT30drDzyR3RZIMVC9O2T66PDcncmdfk5qkDgbij8sfVc/LPV7Xo6+3BzUvyy+QxmQme+RGDWPRBX4zB1acBPvEdYwDTHml7brQqP02+LbfPvx79oPnx9Ggg8JB8dvjlBv5w+lX58uQBF4NY9EFfjOG2QH07UHzSc4SdT+7grzeKnr943K3otx8clCvHq3L5yB6ZHh10YsHP39onX7970BFlxCD254kTru/tj94Ir/XxaCQzgKRxdj7LjvdOLIpmpVJpoI2PYXEx9jAUPRQFbaWzZ9OZhYWFcBwwKGNLvjO0O7ra8CWjFQbYR2KyJQZQfJ2r24AgA7R49zeaRSsMsKnfzi3QtAF7KzUBB54Zd9ejw3cbqNts+/DQrJSuXfuf4+NSunVLSnfuuBsmvip580Sdo44HUQdR5L17Ifk5KZ4xtp39ySxQ4OMYALo/OjEREmVOvG5CJJ4T0vGgFq3JcXQsBbIPDbXtj2NAksCsdu8EOUlMEBmhRep40E5Ykyusx7eG2XY7RhayBGa1u7TnBFDWf5wG6LqkeMZBoC5bgTqb8soAHYN9rxkJITF5LZpl1utYGmBFq/54KCNvBA9f+P2hiTodY9ut3hh8BlCczoBEA7QYmKEN8AnThnEL+PrUU91nwNzl8Ugg61tqgM2AtPaYILv63LPWAKatR7Q2RIuzBuDqM8DV12Os3hgoLElgpgF2D2YZYL8FfLEJBtgVtgb4tojVG8OjGJDWHjOAgqwofk6L91CLSzLAZsiSDBgZGREwSSDrGTc1NdXASBCuzABSr36SATqeMSwH/bQ4a4AzQRnAdr1FrN4YKCxJYFa73iK4WgNBd7NUBuibKttdDLdJQN6EkwygSF+GLJsBvgxqMCEQlhbPGF1nV7jhBhjQd49YkgEFChQoUKBAgQIFChQoUKBAgQLNounDVbwVauXhZ95o2gBz/r/6DNAZsNiGf4BoN1pqwEIb/gWm1eDLTf2WV9O+BOXbXjJ6nU7qV+m+/yewZwfLjUc1IKndidLnBDz9pRG6XZ8krSQD0tpjBmhxMCGtvSsNaPX5f7uhxfkEWgPs8bo+1PCd7fkOPjTtfHIHxfmOupZiQNbRV0cbkJbiWe3WAH2sZQ1ghvBYbEUZQNp2e7hJYVEmqNX3bRE7n9yRJTCr3aa4zwBtUscZwFPjJIGsTzpdbhB/Jr7HG7JDGdQxWyDr+Dyr3bfCOgtWhQGkE6pucK5sMqTVBvwH+QeX13iz8VkAAAAASUVORK5CYII=",
            slim: false,
        },
    },
};

async function getMojangProfile(user) {
    let uuid = user.replace("-", ""); // Store all uuids without dashes, to prevent dupes
    if (!isUUID(user)) {
        uuid = getUUID(user);
    }
    const profile = (await axios.get(sessionApi + uuid)).data;
    // Mojang returns nothing on this endpoint if no user...
    if (!profile) throw new ApiError(400, "No user found");
    return profile.data;
}

async function getProfile(uuid) {
    if (!isUUID(uuid)) throw new ApiError(401, "Invalid UUID");
    uuid = uuid.replaceAll("-", ""); // Store all uuids without dashes, to prevent dupes and other issues

    // Check for profile locally
    const profile = await ProfileDB.findById(uuid);
    if (profile?.uuid) {
        log.debug(`Profile lookup - Found profile for ${profile.name} (${profile.uuid}) locally`);
        // TODO: schedule check for reevaluation
        return profile;
    }

    // If not locally, get from mojang and cache
    const mojangNameUUID = await getMojangProfile(uuid);
    const mojangProfile = JSON.parse(Buffer.from(mojangNameUUID.properties[0].value, "base64"));
    const mojangTextures = mojangProfile.textures;

    let newProfile = {
        uuid: mojangNameUUID.id,
        name: mojangNameUUID.name,
        time: Date.now(),
        assets: {
            skin: {
                url: mojangTextures.SKIN.url,
                base64: await getBase64FromURL(mojangTextures.SKIN.url),
                slim: mojangTextures.SKIN?.metadata?.model === "slim",
            },
        },
    };

    if (mojangTextures.CAPE) {
        newProfile.assets.cape = {
            url: mojangTextures.CAPE.url,
            base64: await getBase64FromURL(mojangTextures.CAPE.url),
        };
    }

    new ProfileDB(newProfile).save();
    return newProfile;
}

async function getUUID(name) {
    if (isUUID(name)) return name;

    const user = await ProfileDB.findOne({ name });

    if (user) {
        log.debug(`UUID lookup - Found user ${user.name} (${user.id}) locally.`);
        return user._id;
    }

    // userProfile only contains name and id (uuid)
    let userProfile;
    try {
        userProfile = (await axios.get(mojangApi + name)).data;
    } catch (e) {
        throw new ApiError(404, "No user found");
    }

    if (userProfile?.id) {
        return userProfile.id;
    } else {
        log.debug(`UUID lookup - No profile found for ${name}`);
        throw new ApiError(404, "No user found");
    }
}

async function getSkin(uuid) {}

module.exports = {
    steveDefault,
    getProfile,
    getUUID,
};
// async function getIfExistsMongo(name) {
//     const data = isUUID(name)
//         ? await mongoSkins.find({ uuid: name.replace(/-/g, "") })
//         : await mongoSkins.find({ name: name });
//     return Object.entries(data).length === 0 ? { success: false } : data[0];
// }

// async function getSkin(name) {
//     let data = null;
//     const dataMongo = await getIfExistsMongo(name);

//     if (dataMongo.success !== true) {
//         const dataMojang = await getDataFromMojang(name);

//         if (dataMojang.success == false) {
//             log.info(`Unable to find ${name}'s skin, using steve as default.`);
//             data = steveDefault;
//         } else {
//             log.info(`Fetched ${name} from Mojang, will save to Mongo.`);
//             data = dataMojang;
//         }

//         // Get data and save to mongo
//         data = await parseMojangProfile(data);
//         data.success = true;
//         mongoSkins.insert(data);
//     } else {
//         log.info(`Found ${name} in mongoDB`);
//         data = dataMongo;
//         checkForUpdates(data);
//     }

//     return data.skin.skinBase64;
// }

// async function checkForUpdates(data) {
//     if (data.time + 43200000 < Date.now()) {
//         log.info(`Updating ${data.name} with new skin`);
//         await mongoSkins.findOneAndDelete(data);
//         await getSkin(data.name);
//     }
// }

// async function parseMojangProfile(jsonProfile) {
//     const name = jsonProfile.profileName;
//     const uuid = jsonProfile.profileId;
//     const skinURL = jsonProfile.textures.SKIN.url;

//     let parsedJson = {
//         time: Date.now(),
//         skin: {
//             skinURL: skinURL,
//             skinBase64: await getBase64FromURL(skinURL),
//         },
//         name,
//         uuid,
//     };

//     // parsedJson.time = Date.now();
//     // parsedJson.skin = {};
//     // parsedJson.skin.skinURL = skinURL;
//     // parsedJson.skin.skinBase64 = await getBase64FromURL(skinURL);
//     // parsedJson.name = name;
//     // parsedJson.uuid = uuid;

//     return parsedJson;
// }

// async function getHead(name, width = 100, height = 100) {
//     const user = await getSkin(name);
//     try {
//         // Load base64 image into Jimp for resizing.
//         var bottom = await Jimp.read(new Buffer.from(user, "base64"));
//         var top = await Jimp.read(new Buffer.from(user, "base64"));
//     } catch (e) {
//         log.warn(`Unable to crop head for ${name}`);
//         return await getBase64FromURL(steveDefault.SKIN.url);
//     }
//     // Crop the image to only the head.
//     bottom.crop(8, 8, 8, 8);
//     top.crop(40, 8, 8, 8);
//     bottom.composite(top, 0, 0);
//     bottom.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);

//     return await bottom.getBase64Async(Jimp.AUTO);
// }

// async function getDataFromMojang(name) {
//     try {
//         let userID;
//         if (!isUUID(name)) {
//             userID = (await axios.get(`https://api.mojang.com/users/profiles/minecraft/${name}`)).data.id;
//             if (userID == null) return { success: false };
//         } else userID = name;

//         const userJson = (await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${userID}`)).data;

//         if (userJson == null) return { success: false };

//         return JSON.parse(new Buffer.from(userJson.properties[0].value, "base64").toString());
//     } catch (e) {
//         log.error(e);
//         return { success: false };
//     }
// }

async function getBase64FromURL(url) {
    const binary = (await axios.get(url, { responseType: "arraybuffer" })).data;
    return Buffer.from(binary, "binary").toString("base64");
}

// async function get3DSkin(name) {
//     const skinB64 = await getSkin(name);
//     const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
//     const skinBuffer = skin.getRender();
//     return skinBuffer;
// }
// async function get3DHead(name) {
//     const skinB64 = await getSkin(name);
//     const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
//     const skinBuffer = skin.getHead();
//     return skinBuffer;
// }

// module.exports = {
//     getSkin,
//     getHead,
//     get3DSkin,
//     get3DHead,
// };
