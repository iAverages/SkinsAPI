const morgan = require("morgan");
const path = require("path");
const rfs = require("rotating-file-stream");

const accessLogStream = rfs.createStream("access.log", {
    interval: "1d",
    path: path.join(__dirname, "../../logs"),
});

module.exports = [
    morgan("common", { stream: accessLogStream }), // Log everything to file
    morgan("dev", {
        skip: (_, res) => {
            return res.statusCode < 400;
        },
    }), // Log errors to console
];
