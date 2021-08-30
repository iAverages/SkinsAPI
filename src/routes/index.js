const express = require("express");
const router = express.Router();
const v1 = require("./v1/index.js");

router.use("/v1", v1);
router.get("/", (_, res) => res.redirect(process.env.REDIRECT ?? "https://danielraybone.com"));

module.exports = router;
