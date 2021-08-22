const express = require("express");
const helmet = require('helmet');
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
const rfs = require('rotating-file-stream');
const log = require("./modules/logger");
const { skin, head, _3d } = require("./routes");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 2000 // limit each IP to 100 requests per windowMs
});

const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(__dirname, '../logs')
})

app.set("trust proxy", true);
app.use([
    limiter,
    morgan("common", { stream: accessLogStream }), // Log everything to file
    morgan("dev", { skip: (req, res) => { return res.statusCode < 400 }}), // Log errors to console
    helmet({ contentSecurityPolicy: false, }),
])

app.get("/", async (req, res) => res.redirect(302, process.env.REDIRECT));

// Routes
app.use("/skin", skin);
app.use("/head", head);
app.use("/3d", _3d);

app.use((error, req, res, next) => {
    const { statusCode } = error;
    log.error(err);
    res.status(statusCode).json({
        success: false,
        message: "An error has occuered."
    })
});

app.listen(port, log.info(`Listening on port ${port}`));