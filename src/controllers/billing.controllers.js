const {deleteAllPdfs} = require("../helpers/pdfFunctions")
const afip = require("../service/afip")
const qr = require("../service/QR")
const fs = require("fs");
const bill = require("../models/billSchema")
const User = require("../models/userSchema")
const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require("jsonwebtoken");

const getLastVoucherController = async (req, res) => {
    try {
        const {salePoint, cbteType} = req.query;

        let info = await afip.get_voucher({salePoint: salePoint, cbteType: cbteType});
        res.status(200).json(info);
    } catch (e) {
        console.log(e)
        res.status(400).json({
            "Status": 400,
            "Message": "Error consiguiendo el último voucher.",
            "error": e.message
        })
    }
}

const getVoucherById = async (req, res) => {
    let voucherId = req.params.id;
    const {salePoint, cbteType} = req.query
    try {
        let info = await afip.get_voucher({number: voucherId, salePoint: salePoint, cbteType: cbteType})
        res.status(200).json(info);
    } catch (e) {
        res.status(400).json({
            "Status": 400,
            "Message": "Error consiguiendo la información de la factura."
        })
    }
}

const getPdfByVoucherNumber = async (req, res) => {
    let cbte = req.params.id
    const {salePoint, cbteType} = req.query;
    try {
        let reqBill = await bill.findOne({cbte: cbte, salePoint: salePoint, cbteType: cbteType});
        let factura = reqBill.factura;
        let comprobante = reqBill.cbte;
        const dir = "/tmp/Pdfs";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        let url = dir + "/" + comprobante + ".pdf";
        fs.writeFileSync(url, factura);
        res.status(200).sendFile(url, (res) => {
            fs.unlinkSync(url);
        });
    } catch (e) {
        res.status(400).json({
            "Status": 400,
            "Message": "Error consiguiendo la información de la factura.",
            error: e.message
        })
    }
}

const getBase64ByVoucherNumber = async (req, res) => {
    let cbte = req.params.id
    const {salePoint, cbteType} = req.query;
    try {
        let reqBill = await bill.findOne({cbte: cbte, salePoint: salePoint, cbteType: cbteType});
        let invoice = reqBill.factura;
        let invoiceBase64 = Buffer.from(invoice).toString('base64');


        res.status(200).json({
            "Status": 200,
            "Factura": invoiceBase64
        })
    } catch (e) {
        res.status(400).json({
            "Status": 400,
            "Message": "Error consiguiendo la factura.",
            "error": e.message,
        })
    }
}

const postBill = async (req, res) => {
    try {
        let newInfo = await afip.create_bill_AFIP(req.body.data);
        let fecha = afip.format(newInfo.CbteFch);
        let dataQR = `Concepto ${newInfo.Concepto},Tipo de Doc:${newInfo.tax_payer_details?.id_type},CUIT: ${newInfo.DocNro},N.Comprobantes:${newInfo.CbteDesde},Importe total:${newInfo.ImpTotal},Tipo de factura:${newInfo.Resultado},CAE:${newInfo.CodAutorizacion},Punto de venta:${newInfo.PtoVta},Fecha de comprobante: ${fecha}`

        await qr.QR(dataQR, newInfo, req.body.app);
        let qrLink = `/tmp/Qrs/${req.body.app}${newInfo.CbteDesde}.jpeg`;

        deleteAllPdfs(req.body.app, newInfo.CbteDesde)
        let pdfBuffer = await afip.create_PDF(newInfo, req.body.app);
        fs.unlinkSync(qrLink);

        let {_id} = await User.findOne({userName: `${req.body.app}`});
        let data = {
            app: _id,
            cbte: newInfo.CbteDesde,
            date: fecha,
            cae: newInfo.CodAutorizacion,
            dcto: newInfo.DocNro,
            factura: pdfBuffer,
            salePoint: newInfo.PtoVta,
            cbteType: newInfo.CbteTipo
        }
        let facturamongo = await bill.create(data)
        res.status(200).json({
            cbte: facturamongo.cbte
        });
    } catch (e) {
        console.log("Error creando factura: ", e);
        res.status(400).json({
            "Status": 400,
            "Message": "Error en la creación de la factura.",
            "error": e.message,
        })
    }
}

const getVouchersByAppId = async (req, res) => {

    let token = req.headers.authorization;
    let value = token.split(" ")[1];
    let secret = jwt.verify(value, process.env.TOKEN_SECRET)
    try {
        let {_id} = await User.findOne({secret: secret});
        let bills = await bill.find({app: new ObjectId(_id)}, {cbte: 1, _id: 0});
        if (bills) {
            res.status(200).json({
                bills
            })
        } else {
            res.status(200).json({
                "Comprobantes": "No hay comprobantes asociados a este Nombre de usuario en nuestra BBDD."
            })
        }
    } catch (e) {
        console.log(e);
        res.status(400).json({
            "Status": 400,
            "Message": "Error consiguiendo la información de la factura."
        })
    }
}

const getTaxPayerDetails = async (req, res) => {
    try {
        let data = await afip.getTaxPayerDetailsByCUIT(req.params.cuit)
        res.status(200).json({
            "data": data
        })
    } catch (e) {
        console.log(e);
        res.status(400).send({
            "data": e.message
        })
    }
}

module.exports = {
    getLastVoucherController,
    getVoucherById,
    getPdfByVoucherNumber,
    postBill,
    getVouchersByAppId,
    getBase64ByVoucherNumber,
    getTaxPayerDetails
}