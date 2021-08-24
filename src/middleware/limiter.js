const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 2000, // limit each IP to 100 requests per windowMs
});

module.exports = limiter;
