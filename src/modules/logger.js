const colors = require('colors');
const axios = require("axios");

/**
 * Prefix message with timestamp
 * @param {String} message 
 */
const logger = (message) => { 
    const date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log(`${colors.gray(`[${date}]`)} ${message}`)
}

/**
 * Log a debug message. Prefixed with a pink [UWU]
 * @param {String} message 
 */
const uwu = (message) => { logger(`${colors.magenta('[UWU]')} ${message}`); }

/**
 * Log a info message. Prefixed with a cyan [INFO]
 * @param {String} message 
 */
const info = (message) => { logger(`${colors.cyan('[INFO]')} ${message}`); }

/**
 * Log a success message. Prefixed with a green [SUCCESS]
 * @param {String} message 
 */
const success = (message) => { logger(`${colors.green('[SUCCESS]')} ${message}`); }

/**
 * Log a warn message. Prefixed with a yellow [WARN]
 * @param {String} message 
 */
const warn = (message) => { logger(`${colors.yellow('[WARN]')} ${message}`); }

/**
 * Log a setup message. Prefixed with a brighBlue [SETUP]
 * @param {String} message 
 */
const setup = (message) => { logger(`${colors.cyan('[SETUP]')} ${message}`);}

/**
 * Log an error message. Prefixed with [ERROR], whole message is in red.
 * @param {String} message 
 */
const error = (message, ping = true) => { 
    logger(`${colors.red(`[ERROR]`)} ${message}`);
    if(ping) {
        try{ 
            axios.post("https://ptb.discord.com/api/webhooks/799269948349349889/E9rqyUKQe0eNQa91fVcYPqd56IVongDGiOls5eDxIOkvpx0GtP_XbPI5JF7irYJsfs55", {content: `[SKINAPI] <@307952129958477824> ${message}`}); 
        } catch (err) {
            logger(`${colors.red('[ERROR]')} ${err.message}`);
        }
    }
}

module.exports = {
    uwu,
    info,
    error,
    success,
    warn,
    setup,
}