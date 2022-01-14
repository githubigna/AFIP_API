const express = require("express");
const router = express.Router();
const moment = require('moment');
const momentZone = require('moment-timezone');
const capitalize = require('capitalize')
const fetch = require("node-fetch");
const afip = require("../service/afip")
const qr = require("../service/QR")
const fs = require("fs");
const path = require('path');

const MongoDb = require("../database/mongoDb");
const mongoDb = new MongoDb();

router.get("/getLastVoucher", async (req, res) => {
    try {
        let info = await afip.get_last_voucher();
        res.status(200).json(info);
    } catch (e) {
        res.status(400).json({
            "Status": 400,
            "Message": "Error consiguiendo el último voucher."
        })
    }
})
router.post("/afip", async (req, res) => {
    try {
        let newinfo = await afip.create_bill_AFIP(req.body.data);
        console.log("newinfo", newinfo);
        let fecha = afip.format(newinfo.CbteFch);
        let dataQR = `Concepto ${newinfo.Concepto},Tipo de Doc:${newinfo.tax_payer_details.id_type},CUIT: ${newinfo.DocNro},N.Comprobantes:${newinfo.CbteDesde},Importe total:${newinfo.ImpTotal},Tipo de factura:${newinfo.Resultado},CAE:${newinfo.CodAutorizacion},Punto de venta:${newinfo.PtoVta},Fecha de comprobante: ${fecha}`

        await qr.QR(dataQR, newinfo, req.body.app);
        await afip.create_PDF(newinfo, req.body.app);
        let qrLink = `src/Qrs/${req.body.app}${newinfo.CbteDesde}.jpeg`;

        fs.unlinkSync(qrLink);
        deleteAllPdfs(req.body.app,newinfo.CbteDesde)
        
        res.status(200).json(newinfo);
    } catch (e) {
        console.log("Error creando factura: ", e);
        res.status(400).json({
            "Status": 400,
            "Message": "Error en la creación de la factura."
        })
    }
})
/**
 * Funcion que lee la carpeta pdf, busca todos los archivos .pdf y uno a uno los elimina,
 * luego de que corra esta función, el único pdf que permanece en la carpeta es el que se creo con este pedido a la api.
 * Que luego será eliminado.
 */
function deleteAllPdfs(app,CbteDesde) {
    fs.readdir('src/Pdfs', (err, files) => {
        const pdfFiles = files.filter(el => path.extname(el) === '.pdf')
        pdfFiles.forEach(file => {
            if (path.toNamespacedPath(file).includes(app)) {
                console.log("Removing File -> ", file);
                var filename = "src/Pdfs/" + file;
                fs.unlink(filename, function (err) {
                    if (err) return console.log(err);
                    console.log('file deleted successfully');
                });
            } else {
                console.log(path.toNamespacedPath(file))
            }
        });
    });
}
async function init() {
    await sleep(1000);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
module.exports = router;
