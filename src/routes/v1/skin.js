const express = require("express");
const router = express.Router();
const catchAsync = require("../../helpers/catchAsync");
const controller = require("../../controller/v1/skin.js");

// Gets the full skin of the specified user
router.get("/:name", catchAsync(controller.getSkin));

module.exports = router;
