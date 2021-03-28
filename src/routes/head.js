const express = require("express");
const router = express.Router();
const { getHead } = require('../modules/skins');
const log = require("../modules/logger");

// Gets the head of the specified user
router.get("/:name", async (req, res) => {
    let width = req.query.width;
    let height = req.query.height;
    // Set default size it not specified
    if (width == null || width <= 0 || isNaN(width))
        width = 300;
    if (height == null || height <= 0 || isNaN(height))
        height = width;
    // Head in base64 from mongo
    let head = await getHead(req.params.name, Math.min(parseInt(width), 1000), Math.min(parseInt(height), 1000)).catch(err => log.error(err));
    // Removes MIME type from start
    head = head.substr(head.indexOf(",") + 1);
    // If requested in base64, return that.
    if (req.query.return == "base64") {
        res.send(head);
        return;
    }
    // Decode base64 string
    const image = Buffer.from(head, "base64");
    // Send file back
    res.writeHead(200, {
        "Content-Type": "image/png",
        "content-Length": image.length
    })
    res.end(image);
})

module.exports = router;