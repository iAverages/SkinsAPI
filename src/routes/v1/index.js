const express = require("express");
const router = express.Router();
const skin = require("./skin.js");
const render3d = require("./render.js");
const head = require("./head.js");
const profile = require("./profile.js");

router.use("/skin", skin);
router.use("/head", head);
router.use("/render", render3d);
router.use("/profile", profile);

module.exports = router;
