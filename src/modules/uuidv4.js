// regex for uuidv4
const validationRegex = /^[A-Za-z0-9]{8}-[A-Za-z0-9]{4}-4[A-Za-z0-9]{3}-[A-Za-z0-9]{4}-[A-Za-z0-9]{12}$/;

if (String.prototype.addCharAt === undefined) {
    String.prototype.addCharAt = function (index, text) {
        let offset = index < 0 ? this.length + index : index;
        return this.substring(0, offset) + text + this.substring(offset);
    }; 
}

const convert = (uuid) => { 
    if (uuid.length != 32)
        throw new Error("Not a valid UUID");
    return uuid
        .addCharAt(8, "-")
        .addCharAt(12 + 1 , "-")
        .addCharAt(17 + 1, "-")
        .addCharAt(22 + 1, "-")
    // 8-4-4-4-12
}
// 1b8f18cf-7fb6-4a7a-8c25-c1ef296459f2
// 1b8f18cf-7fb-64a-7a8-c25c1ef296459f2
module.exports.isUUID = (uuid) => {
    try { 
        if (uuid.length == 36)
            return validationRegex.test(uuid);
        else if (uuid.length == 32)
            return validationRegex.test(convert(uuid));
        else
            return false;
    } catch (e) { 
        return false;
    }
}