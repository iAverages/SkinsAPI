const helmet = require("helmet");
const morgan = require("./morgan");
const limiter = require("./limiter");
const parseOptions = require("./parseOptions");

module.exports = [helmet(), [...morgan], limiter, parseOptions];
