const { Schema, model } = require("mongoose");

const schema = new Schema({
    time: { type: Number, required: true }, // Time last updated
    _id: { type: String, required: true }, // Players UUID
    name: { type: String, required: true },
    assests: {
        skin: {
            url: { type: String, required: true },
            base64: { type: String, required: true },
            slim: { type: Boolean, default: false },
        },
        cape: {
            url: { type: String, required: true },
            base64: { type: String, required: true },
        },
    },
});

schema.method("transform", function () {
    const obj = this.toObject();
    // Replace _id with uuid
    obj.uuid = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
});

const doc = model("profiles", schema);
module.exports = doc;
