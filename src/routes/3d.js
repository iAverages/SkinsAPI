const express = require("express");
const router = express.Router();
const { get3DSkin, get3DHead } = require('../modules/skins');

router.get('/skin/:name', async (req, res) => {
    try {
        res.set('Content-Type', 'image/png');
        res.send(await get3DSkin(req.params.name));
    } catch (e) { throw (e) }
});

router.get('/head/:name', async (req, res) => {
    try {
        res.set('Content-Type', 'image/png');
        res.send(await get3DHead(req.params.name));
    } catch (e) { throw (e) }
});

module.exports = router;