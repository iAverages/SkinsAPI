require("dotenv").config({ path: __dirname + "/../.env" });
const express = require("express");
const middleware = require("./middleware");
const log = require("./helpers/logger");
const ApiError = require("./helpers/ApiError");
const errorHandler = require("./middleware/error");
const router = require("./routes");
const database = require("./database/mongo");
const app = express();
const port = process.env.PORT || 3000;
let server;

app.set("trust proxy", true);
app.use(middleware);
app.use("/", router);

// 404 Handler
app.use((_, __, next) => next(new ApiError(404, "404 Not found")));

// Error handler
app.use(errorHandler);

// Attempt to connect to database, on sucess start express
// Close on error
database
    .then(() => {
        server = app.listen(port, () => log.info(`Listening on port ${port}`));
    })
    .catch(() => {
        process.exit(1);
    });

["SIGTERM", "SIGINT"].forEach((event) => {
    process.on(event, () => {
        server?.close();
        process.exit(1);
    });
});
