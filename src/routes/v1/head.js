const express = require("express");
const router = express.Router();
const controller = require("../../controller/v1/head");

// Gets the head of the specified user
router.get("/:name", controller.getHead);

module.exports = router;
