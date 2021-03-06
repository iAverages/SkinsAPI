const express = require("express");
const router = express.Router();
const catchAsync = require("../../helpers/catchAsync");
const controller = require("../../controller/v1/cape");

// Gets the head of the specified user
router.get("/:name", catchAsync(controller.getCape));

module.exports = router;
