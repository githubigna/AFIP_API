const express = require("express");
const router = express.Router();
const version = process.env.VERSION;

router.get(`/` , (req, res) => {
    console.log("ACAAAAAAAAAAA")
    res.redirect("https://documenter.getpostman.com/view/5827368/UVkjvd4q")
});

module.exports = router;