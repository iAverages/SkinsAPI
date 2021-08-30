const express = require("express");
const router = express.Router();
const catchAsync = require("../../helpers/catchAsync");
const controller = require("../../controller/v1/head");

// Gets the head of the specified user
router.get("/:name", catchAsync(controller.getHead));

module.exports = router;
