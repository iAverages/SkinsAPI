const { Schema, model } = require("mongoose");

// TODO: Implement a no user cache.
// Basically a mongo collection which stores users which
// Have been requested but are not a user on mc.
// Stops sending repeat requests for users that dont exist.
// Ofc with a timeout to recheck

const schema = new Schema({
    time: { type: Number, default: Date.now() }, // Time last updated
    _id: { type: String, required: true, alias: "uuid" }, // Players UUID
    name: { type: String, required: true, index: true, unique: true },
    assets: {
        skin: {
            url: { type: String, required: true },
            base64: { type: String, required: true },
            slim: { type: Boolean, default: false },
        },
        cape: {
            url: { type: String },
            base64: { type: String },
        },
    },
});

schema.method("toJSON", function () {
    const obj = this.toObject();
    // Replace _id with uuid
    obj.uuid = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
});

const doc = model("profiles", schema);
module.exports = doc;
