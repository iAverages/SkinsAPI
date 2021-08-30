const getPositive = (number, def) => (Math.sign(number) > 0 ? number : def);

module.exports = {
    getPositive,
};
