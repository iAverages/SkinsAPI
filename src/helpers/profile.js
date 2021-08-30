const axios = require("axios");
const log = require("./logger");
const Jimp = require("jimp");
const ApiError = require("./ApiError");
const { isUUID } = require("./uuidv4");
const ProfileDB = require("../database/schema/profile");
const bodyParts = require("./bodySection");
const MinecraftSkin = require("./3dRender");
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

async function getBase64FromURL(url) {
    const binary = (await axios.get(url, { responseType: "arraybuffer" })).data;
    return Buffer.from(binary, "binary").toString("base64");
}

async function getMojangProfile(user) {
    let uuid = user.replace("-", ""); // Store all uuids without dashes, to prevent dupes
    if (!isUUID(user)) {
        uuid = getUUID(user);
    }
    const profile = (await axios.get(sessionApi + uuid)).data;
    // Mojang returns nothing on this endpoint if no user...
    if (!profile) throw new ApiError(400, "No user found");
    log.debug(`Mojang Profile - Found profile for ${profile.name} (${profile.id})`);
    return profile;
}

/**
 * Internal function to get and construct a profile. Ignores cache and doesnt save to cache.
 * @param {string} uuid UUID of the player
 * @returns {Promise<object>} Players profile
 */
async function _getProfile(uuid) {
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

    return newProfile;
}

/**
 * Function to get a players profile by UUID.
 * @param {string} uuid UUID of the player
 * @returns {Promise<object>} Player profile
 */
async function getProfile(uuid) {
    if (!isUUID(uuid)) throw new ApiError(400, "Invalid UUID");
    uuid = uuid.replaceAll("-", ""); // Store all uuids without dashes, to prevent dupes and other issues

    // Check for profile locally
    const profile = await ProfileDB.findById(uuid);
    if (profile?.uuid) {
        log.debug(`Profile lookup - Found profile for ${profile.name} (${profile.uuid}) locally`);

        // Check if skin needs updating. Next request will have updated skin.
        checkForUpdate(profile);
        return profile;
    }

    // If not locally, get from mojang and cache
    const newProfile = await _getProfile(uuid);

    new ProfileDB(newProfile).save();
    return newProfile;
}

async function checkForUpdate(profile) {
    if (profile.time + 21600000 > Date.now()) return;
    log.debug(`Refreshing skin for ${profile.name} (${profile.uuid})`);
    const newProfile = await _getProfile(profile.uuid);
    await ProfileDB.findByIdAndUpdate(profile.uuid, newProfile);
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

function useSecondLayer(skin) {
    // Fix for skins that are using the old format (before second layer was added / whatever mojang done)
    // The left arm and leg are both lower and it seems at one point only the right arm was set
    // Then copied over to the left and flipped. Not sure if this is the case but it seems like it.
    const newFormat = skin.bitmap.height === 64;

    // A "fix" specifically for Notchs skin but may apply to others.
    // Since you can set the areas that are not used (i.e Notchs skin is black instead
    // of transparent)
    const secondLayer = skin.hasAlpha();

    return newFormat && secondLayer;
}

async function getSkin64(uuid) {
    if (!isUUID(uuid)) throw new ApiError(400, "Invalid UUID");
    const profile = await getProfile(uuid);
    return profile.assets.skin.base64;
}

// TODO: Optimize the performance of these 2d renders, they are slow.
async function getHead64(uuid, width, height, overlay = true) {
    const skinBuffer = new Buffer.from(await getSkin64(uuid), "base64");
    const bottom = await Jimp.read(skinBuffer);
    const applySecondLayer = useSecondLayer(bottom);

    // Crop the image to only the head.
    bottom.crop(...bodyParts.firstLayer.head.front);

    // Add second lay of skin
    if (overlay && applySecondLayer) {
        const top = await Jimp.read(skinBuffer);
        top.crop(...bodyParts.secondLayer.head.front);
        bottom.composite(top, 0, 0);
    }

    bottom.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);

    return bottom.getBase64Async(Jimp.MIME_PNG);
}

async function getBody64(uuid, width = 160, height = 320, overlay = true) {
    const profile = await getProfile(uuid);
    const skinBuffer = new Buffer.from(profile.assets.skin.base64, "base64");
    const isSlim = profile.assets.skin.slim;
    const skin = await Jimp.read(skinBuffer);
    const applySecondLayer = useSecondLayer(skin);

    const base = new Jimp(16, 32);
    const head = skin.clone();
    const torso = skin.clone();
    const lArm = skin.clone();
    const rArm = skin.clone();
    const lLeg = skin.clone();
    const rLeg = skin.clone();

    head.crop(...bodyParts.firstLayer.head.front);
    torso.crop(...bodyParts.firstLayer.torso.front);

    // See comment in useSecondLayer function
    const lArmPoints = applySecondLayer
        ? [...bodyParts.firstLayer.arms.left.front]
        : [...bodyParts.firstLayer.arms.right.front];
    const lLegPoints = applySecondLayer
        ? [...bodyParts.firstLayer.legs.left.front]
        : [...bodyParts.firstLayer.legs.right.front];

    const rArmPoints = [...bodyParts.firstLayer.arms.right.front];

    // Correction for slim skin arms;
    if (isSlim) {
        lArmPoints[2] = lArmPoints[2] - 1;
        rArmPoints[2] = rArmPoints[2] - 1;
    }

    lArm.crop(...lArmPoints);
    rArm.crop(...rArmPoints);
    lLeg.crop(...lLegPoints);
    rLeg.crop(...bodyParts.firstLayer.legs.right.front);

    !applySecondLayer && lArm.flip(true, false) && lLeg.flip(true, false);

    base.composite(head, 4, 0);
    base.composite(torso, 4, 8);
    base.composite(lArm, 12, 8);
    base.composite(rArm, isSlim ? 1 : 0, 8);
    base.composite(lLeg, 8, 20);
    base.composite(rLeg, 4, 20);

    if (overlay && applySecondLayer) {
        try {
            const head2 = skin.clone();
            const torso2 = skin.clone();
            const lArm2 = skin.clone();
            const rArm2 = skin.clone();
            const lLeg2 = skin.clone();
            const rLeg2 = skin.clone();

            const lArmPoints2 = [...bodyParts.secondLayer.arms.left.front];
            const rArmPoints2 = [...bodyParts.secondLayer.arms.right.front];

            if (isSlim) {
                lArmPoints2[2] = lArmPoints2[2] - 1;
                rArmPoints2[2] = rArmPoints2[2] - 1;
            }

            head2.crop(...bodyParts.secondLayer.head.front);
            torso2.crop(...bodyParts.secondLayer.torso.front);
            lArm2.crop(...lArmPoints2);
            rArm2.crop(...rArmPoints2);
            lLeg2.crop(...bodyParts.secondLayer.legs.left.front);
            rLeg2.crop(...bodyParts.secondLayer.legs.right.front);

            base.composite(head2, 4, 0);
            base.composite(torso2, 4, 8);
            base.composite(lArm2, 12, 8);
            base.composite(rArm2, isSlim ? 1 : 0, 8);
            base.composite(lLeg2, 4, 20);
            base.composite(rLeg2, 8, 20);
        } catch (e) {
            log.debug(`2D Render - ${uuid} had no second layer.`);
        }
    }

    base.resize(width, height, Jimp.RESIZE_NEAREST_NEIGHBOR);

    return base.getBase64Async(Jimp.MIME_PNG);
}

async function get3DSkin(name) {
    const skinB64 = await getSkin64(name);
    const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
    return skin.getRender();
}

async function get3DHead(name) {
    const skinB64 = await getSkin64(name);
    const skin = new MinecraftSkin(Buffer.from(skinB64, "base64"), false, 120);
    return skin.getHead();
}

async function getCape64(uuid) {
    if (!isUUID(uuid)) throw new ApiError(400, "Invalid UUID");
    const profile = await getProfile(uuid);
    return profile.assets.cape.base64;
}

module.exports = {
    steveDefault,
    getProfile,
    getUUID,
    getSkin64,
    getHead64,
    getBody64,
    get3DSkin,
    get3DHead,
    getCape64,
};
