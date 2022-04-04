const express = require("express");
const router = express.Router();
const {authenticate} = require("../controllers/auth.controllers")

router.post("/token",authenticate);

module.exports = router;