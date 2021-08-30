// regex for uuidv4 - without dashes
const validationRegex = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-4[A-Za-z0-9]{3}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;
const validationRegexNoDash = /^[A-Za-z0-9]{12}4[A-Za-z0-9]{19}$/;

module.exports.isUUID = (uuid) => {
    try {
        if (uuid.length == 36) return validationRegex.test(uuid);
        else if (uuid.length == 32) return validationRegexNoDash.test(uuid);
        else return false;
    } catch (e) {
        return false;
    }
};
