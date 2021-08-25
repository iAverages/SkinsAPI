module.exports = (req, _, next) => {
    const q = req.query;

    // Basically what this does is, ensure both width and height are set.
    // If both are specified in the query, it'll use those (Math.min to 1000)
    // If only one is set, both are set to the same value (Whatever one is set)
    // If neither are set, defaults to 300
    const width = Math.min(1000, check(q?.width) ? +q.width : check(q?.height) ? +q.height : 300);
    const height = Math.min(1000, check(q?.height) ? +q.height : width);

    req.options = {
        base64: isTrue(q.base64),
        overlay: q.overlay ? isTrue(q.overlay) : true, // overlay defaults to true
        width: width,
        height: height,
    };
    next();
};

const check = (n) => !(n === null || +n <= 0 || isNaN(+n));
const isTrue = (n) => n?.toLowerCase() === "true";
