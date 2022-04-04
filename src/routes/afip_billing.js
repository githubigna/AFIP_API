const express = require("express");
const router = express.Router();

const {auth} = require("../middlewares/auth")
const {
    getLastVoucherController,
    getVoucherById,
    getPdfByVoucherNumber,
    postBill,
    getVouchersByAppId,
    getBase64ByVoucherNumber,
    getTaxPayerDetails
} = require("../controllers/billing.controllers")


router.get("/getLastVoucher", auth, getLastVoucherController)

router.get("/:id", auth, getVoucherById)

router.get("/pdf/:id", auth, getPdfByVoucherNumber)

router.get("/base64/:id", auth, getBase64ByVoucherNumber)

router.post("/", auth, postBill)

router.get("/retrieve/bills", auth, getVouchersByAppId)

router.get("/retrieve/clientData/:cuit", auth, getTaxPayerDetails)


module.exports = router;
