const express = require("express");
const router = express.Router();
const controller = require("../../controller/v1/render");

router.get("/head/:name", controller.get3dHead);
router.get("/body/:name", controller.get3dBody);

module.exports = router;
