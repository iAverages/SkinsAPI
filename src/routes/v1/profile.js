const express = require("express");
const router = express.Router();
const catchAsync = require("../../helpers/catchAsync");
const controller = require("../../controller/v1/profile");

router.get("/:name", catchAsync(controller.profile));

module.exports = router;
