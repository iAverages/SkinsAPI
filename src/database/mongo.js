const log = require("../helpers/logger");
const mongoose = require("mongoose");
const mongoURL = process.env.MONGO_URI ?? "mongodb://localhost/skins_api";

module.exports = new Promise((resolve, reject) => {
    log.info("Connecting to mongo");

    // Connect to mongodb
    mongoose
        .connect(mongoURL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true,
        })
        .catch((err) => {
            log.error("Failed to connect to mongoDB");
            log.error(err);
            reject(err);
        });

    mongoose.connection.once("open", () => {
        log.success("Connected to mongo");
        resolve();
    });
});
