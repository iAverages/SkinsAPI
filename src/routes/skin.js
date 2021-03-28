const express = require("express");
const router = express.Router();
const { getSkin } = require('../modules/skins');

// Gets the full skin of the specified user
router.get("/:name", async (req, res) => {

    const skin = await getSkin(req.params.name);
    const image = Buffer.from(skin, "base64");

    res.writeHead(200, {
        "Content-Type": "image/png",
        "content-Length": image.length
    });
    res.end(image);
})

module.exports = router;