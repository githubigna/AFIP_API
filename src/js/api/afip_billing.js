const express = require("express");
const router = express.Router();
const moment = require('moment');
const momentZone = require('moment-timezone');
const capitalize = require('capitalize')
const fetch = require("node-fetch");
const afip = require("../service/afip")
const qr = require("../service/QR")

const MongoDb = require("../database/mongoDb");
const mongoDb = new MongoDb();

router.get("/afip", async (req, res) => {
    // console.log("req",req.body.documento);
    // let taxpayer = await afip.get_tax_payer_details(req.body.documento);
    if(req.body.getlasvoucher){
        let info = await afip.get_last_voucher();
    }else{
        let newinfo = await afip.create_bill_AFIP(req.body);
        console.log("newinfo",newinfo);
        let fecha = afip.format(newinfo.CbteFch);
        let dataQR = `Concepto ${newinfo.Concepto},Tipo de Doc:${newinfo.tax_payer_details.id_type},CUIT: ${newinfo.DocNro},N.Comprobantes:${newinfo.CbteDesde},Importe total:${newinfo.ImpTotal},Tipo de factura:${newinfo.Resultado},CAE:${newinfo.CodAutorizacion},Punto de venta:${newinfo.PtoVta},Fecha de comprobante: ${fecha}`
        
        await qr.QR(dataQR);
        await afip.create_PDF(newinfo);
    }
res.sendStatus(200);
})

module.exports = router;
