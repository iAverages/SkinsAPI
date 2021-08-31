const express = require("express");
const router = express.Router();
const controller = require("../../controller/v1/render");
const catchAsync = require("../../helpers/catchAsync");

router.get("/head/:name", catchAsync(controller.get3dHead));
router.get("/body/:name", catchAsync(controller.get3dBody));

module.exports = router;
