const Afip = require('afip-sdk');

const fs = require('fs');
const base64 = require("base64-img")
const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
const pdfFrom = require("pdf-from");
const handlebars = require('handlebars')


let dataReferencia = {
    'CantReg': 1, // Cantidad de comprobantes a registrar
    'PtoVta': 1, // Punto de venta
    'CbteTipo': 6, // Tipo de comprobante (ver tipos disponibles)
    'Concepto': 1, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
    'DocTipo': 80, // Tipo de documento del comprador (ver tipos disponibles)
    'DocNro': 20111111112, // Numero de documento del comprador
    'CbteDesde': 1, // Numero de comprobante o numero del primer comprobante en caso de ser mas de uno
    'CbteHasta': 1, // Numero de comprobante o numero del ultimo comprobante en caso de ser mas de uno
    'CbteFch': parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
    'ImpTotal': 184.05, // Importe total del comprobante
    'ImpTotConc': 0, // Importe neto no gravado
    'ImpNeto': 150, // Importe neto gravado
    'ImpOpEx': 0, // Importe exento de IVA
    'ImpIVA': 26.25, //Importe total de IVA
    'ImpTrib': 7.8, //Importe total de tributos
    'FchServDesde': null, // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
    'FchServHasta': null, // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
    'FchVtoPago': null, // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
    'MonId': 'PES', //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
    'MonCotiz': 1, // Cotización de la moneda usada (1 para pesos argentinos)
    'CbtesAsoc': [ // (Opcional) Comprobantes asociados
        {
            'Tipo': 6, // Tipo de comprobante (ver tipos disponibles)
            'PtoVta': 1, // Punto de venta
            'Nro': 1, // Numero de comprobante
            'Cuit': 20111111112 // (Opcional) Cuit del emisor del comprobante
        }
    ],
    'Tributos': [ // (Opcional) Tributos asociados al comprobante
        {
            'Id': 99, // Id del tipo de tributo (ver tipos disponibles)
            'Desc': 'Ingresos Brutos', // (Opcional) Descripcion
            'BaseImp': 150, // Base imponible para el tributo
            'Alic': 5.2, // Alícuota
            'Importe': 7.8 // Importe del tributo
        }
    ],
    'Iva': [ // (Opcional) Alícuotas asociadas al comprobante
        {
            'Id': 5, // Id del tipo de IVA (ver tipos disponibles)
            'BaseImp': 100, // Base imponible
            'Importe': 21 // Importe
        }
    ],
    'Opcionales': [ // (Opcional) Campos auxiliares
        {
            'Id': 17, // Codigo de tipo de opcion (ver tipos disponibles)
            'Valor': 2 // Valor
        }
    ],
    'Compradores': [ // (Opcional) Detalles de los clientes del comprobante
        {
            'DocTipo': 80, // Tipo de documento (ver tipos disponibles)
            'DocNro': 20111111112, // Numero de documento
            'Porcentaje': 100 // Porcentaje de titularidad del comprador
        }
    ]
};
/** (1)  CODIGOS DE DOCUMENTOS
 * -----------------------
 *
 0    CI Policía Federal
 1    CI Buenos Aires
 2    CI Catamarca
 3    CI Córdoba
 4    CI Corrientes
 5    CI Entre Ríos
 6    CI Jujuy
 7    CI Mendoza
 8    CI La Rioja
 9    CI Salta
 10    CI San Juan
 11    CI San Luis
 12    CI Santa Fe
 13    CI Santiago del Estero
 14    CI Tucumán
 16    CI Chaco
 17    CI Chubut
 18    CI Formosa
 19    CI Misiones
 20    CI Neuquén
 21    CI La Pampa
 22    CI Río Negro
 23    CI Santa Cruz
 24    CI Tierra del Fuego
 80    CUIT
 86    CUIL
 87    CDI
 89    LE
 90    LC
 91    CI extranjera
 92    en trámite
 93    Acta nacimiento
 94    Pasaporte
 95    CI Bs. As. RNP
 96    DNI
 99    Sin identificar/venta global diaria
 30    Certificado de Migración
 88    Usado por Anses para Padrón

 *
 */

//-----------------------------------------------------------------------------------

/** (2) CODIGOS DE MONEDA
 *
 000    OTRAS MONEDAS
 PES    PESOS
 DOL    Dólar ESTADOUNIDENSE
 ´002    Dólar EEUU LIBRE
 003    FRANCOS FRANCESES
 004    LIRAS ITALIANAS
 005    PESETAS
 006    MARCOS ALEMANES
 007    FLORINES HOLANDESES
 008    FRANCOS BELGAS
 009    FRANCOS SUIZOS
 010    PESOS MEJICANOS
 011    PESOS URUGUAYOS
 012    REAL
 013    ESCUDOS PORTUGUESES
 014    CORONAS DANESAS
 015    CORONAS NORUEGAS
 016    CORONAS SUECAS
 017    CHELINES AUTRIACOS
 018    Dólar CANADIENSE
 019    YENS
 021    LIBRA ESTERLINA
 022    MARCOS FINLANDESES
 023    BOLIVAR (VENEZOLANO)
 024    CORONA CHECA
 025    DINAR (YUGOSLAVO)
 026    Dólar AUSTRALIANO
 027    DRACMA (GRIEGO)
 028    FLORIN (ANTILLAS HOLA
 029    GUARANI
 030    SHEKEL (ISRAEL)
 031    PESO BOLIVIANO
 032    PESO COLOMBIANO
 033    PESO CHILENO
 034    RAND (SUDAFRICANO)
 035    NUEVO SOL PERUANO
 036    SUCRE (ECUATORIANO)
 040    LEI RUMANOS
 041    DERECHOS ESPECIALES DE GIRO
 042    PESOS DOMINICANOS
 043    BALBOAS PANAMEÑAS
 044    CORDOBAS NICARAGÛENSES
 045    DIRHAM MARROQUÍES
 046    LIBRAS EGIPCIAS
 047    RIYALS SAUDITAS
 048    BRANCOS BELGAS FINANCIERAS
 049    GRAMOS DE ORO FINO
 050    LIBRAS IRLANDESAS
 051    Dólar DE HONG KONG
 052    Dólar DE SINGAPUR
 053    Dólar DE JAMAICA
 054    Dólar DE TAIWAN
 055    QUETZAL (GUATEMALTECOS)
 056    FORINT (HUNGRIA)
 057    BAHT (TAILANDIA)
 058    ECU
 059    DINAR KUWAITI
 060    EURO
 061    ZLTYS POLACOS
 062    RUPIAS HINDÚES
 063    LEMPIRAS HONDUREÑAS
 064    YUAN (Rep. Pop. China)

 */

//-----------------------------------------------------------------------------------

/** (3) CODIGO DE IVA
 0    No Corresponde
 1    No Gravado
 2    Exento
 3    0%
 4    10,50%
 5    21%
 6    27%
 7    Gravado
 8    5%
 9    2,50%
 *
 */

//-----------------------------------------------------------------------------------
/**
 * poner cuit de Apeiron
 */
const afip = new Afip({
    CUIT: process.env.AFIP_CUIT,
    cert: "cert.pem",
    key: "key.key",
    res_folder: `${process.env.CERT_FOLDER}`,
    ta_folder: `${process.env.CERT_FOLDER}`,
    MONGO_URL: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_CONNECT}@${process.env.MONGO_DB}.ioqfz.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`,
    MONGO_COLLECTION: "permisos",
    production: process.env.FLAVOR === "prod"
});

console.log("FOLDER: ", process.env.CERT_FOLDER)
console.log("Flavor: ", process.env.FLAVOR)


/**
 * esto iria el llamado en la ruta de la API nueva.
 */
async function create_bill_AFIP(data) {
    let info = await get_billing_info_AFIP(data);
    let voucher = await create_voucher_AFIP(info);
    let documento = data.DocNro;
    voucher["item"] = data.Item;
    voucher["items"] = data.items
    voucher["descripcion"] = data.Descripcion;
    voucher["bonificacion"] = changeDecimalToPercentage(data.Bonificacion);
    voucher["subtotal"] = getSubtotalFromItems(data.items);
    voucher = await get_tax_payer_details(voucher, documento);
    voucher.FchVto = afip.ElectronicBilling.formatDate(voucher.FchVto);
    voucher.FchServDesde = afip.ElectronicBilling.formatDate(voucher.FchServDesde);
    voucher.FchServHasta = afip.ElectronicBilling.formatDate(voucher.FchServHasta);
    voucher.FchVtoPago = afip.ElectronicBilling.formatDate(voucher.FchVtoPago);
    let FchProceso = afip.ElectronicBilling.formatDate(voucher.FchProceso);
    voucher.FchProceso = FchProceso.substr(0, 10);
    voucher.Observaciones = voucher.Observaciones?.Obs[0].Msg || ""
    voucher.conditionIva = info.Condicion || ""

    return voucher;
}

function getSubtotalFromItems(items) {
    let subtotal = 0;
    for (let i = 0; i < items.length; i++) {
        let price = items[i].totalPrice;
        price = parseInt(price);
        subtotal = subtotal + price;
    }
    return subtotal;
}

function changeDecimalToPercentage(decimal) {
    return decimal * 100;
}

//-----------------------------------------------------//
function merge_data_for_bill(voucher, client_data) {
    let tipo = client_data.tipoPersona
    let tax_payer_details;
    if (tipo === "JURIDICA") {
        tax_payer_details = {
            tipo_persona: client_data.tipoPersona,
            id: client_data.idPersona,
            id_type: client_data.tipoClave,
            document: client_data.idActividadPrincipal,
            forma_juridica: client_data.formaJuridica,
            razonSocial: client_data.razonSocial,
            activity: client_data.descripcionActividadPrincipal,
            adres_info: {
                adress: client_data.domicilio[0].direccion,
                postal_code: client_data.domicilio[0].codigoPostal,
                province: client_data.domicilio[0].descripcionProvincia,
                adress_type: client_data.domicilio[0].tipoDomicilio
            },
        }
    } else if (tipo === "FISICA") {
        let razonSocial = client_data.nombre + " " + client_data.apellido
        tax_payer_details = {
            tipo_persona: client_data.tipoPersona,
            id: client_data.idPersona,
            id_type: client_data.tipoClave,
            document: client_data.numeroDocumento,
            forma_juridica: client_data.tipoDocumento,
            razonSocial: razonSocial,
            activity: client_data.descripcionActividadPrincipal,
            adres_info: {
                adress: client_data.domicilio[0].direccion,
                postal_code: client_data.domicilio[0].codigoPostal,
                province: client_data.domicilio[0].descripcionProvincia,
                adress_type: client_data.domicilio[0].tipoDomicilio
            },
        }
    }
    voucher["tax_payer_details"] = tax_payer_details
    return voucher;
}

//-----------------------------------------------------//

async function get_billing_info_AFIP(client_data) {
    return {
        PtoVta: client_data.PtoVta,
        CbteTipo: client_data.CbteTipo,
        DocTipo: client_data.DocTipo, // PUNTO (1) -------------->
        DocNro: client_data.DocNro,
        ImpTotal: client_data.ImpTotal,
        ImpNeto: client_data.ImpNeto,
        ImpIVA: client_data.ImpIVA,
        FchServDesde: client_data.FchServDesde,
        FchServHasta: client_data.FchServHasta,
        FchVtoPago: client_data.FchVtoPago,
        Condicion: client_data.Condicion,
        MonId: client_data.MonId, //PUNTO (2) ---------->
        MonCotiz: client_data.MonCotiz, //COTIZACION DE LA MONEDA PUESTA PES - 1
        Iva: [{
            Id: client_data.Iva[0].Id, // PUNTO (3) ---------->
            BaseImp: client_data.Iva[0].BaseImp, // MONTO TOTAL (BRUTO);
            Importe: client_data.Iva[0].Importe // 21% DEL TOTAL (IVA COBRADO);
        }]
    };
}

async function create_voucher_AFIP(info) {
    try {
        const data = {
            'CantReg': 1, // Cantidad de comprobantes a registrar TODO
            'PtoVta': info.PtoVta, // Punto de venta// DEL PROCESO
            'CbteTipo': info.CbteTipo || 1, // Tipo de comprobante (ver tipos disponibles) // TODO: cambiar entre factura A y factura B
            'Concepto': 2, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios TODO
            'DocTipo': info.DocTipo, // Tipo de documento del comprador (ver tipos disponibles)
            'DocNro': info.DocNro, // Numero de documento del comprador
            'CbteFch': parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
            'ImpTotal': info.ImpTotal, // Importe total del comprobante
            'ImpTotConc': 0, // Importe neto no gravado TODO
            'ImpNeto': info.ImpNeto, // Importe neto gravado
            'ImpOpEx': 0, // Importe exento de IVA TODO
            'ImpIVA': info.ImpIVA, //Importe total de IVA
            'ImpTrib': 0, //Importe total de tributos TODO
            'FchServDesde': info.FchServDesde, // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'FchServHasta': info.FchServHasta, // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'FchVtoPago': info.FchVtoPago, // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
            'MonId': `${info.MonId}`, //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos)
            'MonCotiz': info.MonCotiz, // Cotización de la moneda usada (1 para pesos argentinos)

            'Iva': [ // (Opcional) Alícuotas asociadas al comprobante
                {
                    'Id': info.Iva[0].Id, // Id del tipo de IVA (ver tipos disponibles)
                    'BaseImp': info.Iva[0].BaseImp, // Base imponible
                    'Importe': info.Iva[0].Importe // Importe
                }
            ],
        };
        await create_voucher(data);
        return await get_voucher({salePoint: info.PtoVta, cbteType: info.CbteTipo});
    } catch (error) {
        throw new Error(`${error}`);
    }
}

async function get_tax_payer_details(voucher, documento) {
    let taxpayerDetails13 = await afip.RegisterScopeThirteen.getTaxpayerDetails(documento);
    if (taxpayerDetails13 !== null) {
        return merge_data_for_bill(voucher, taxpayerDetails13)
    }
    return voucher;
}

async function getTaxPayerDetailsByCUIT(documento) {
    return await afip.RegisterScopeThirteen.getTaxpayerDetails(documento);
}

/**
 * @typedef GetVoucherData
 * @property {Number | undefined} number Numero de factura
 * @property {Number} salePoint Punto de venta
 * @property {Number} cbteType Tipo de comprobante
 */

/**
 * Obtiene un comprobante
 * @param {GetVoucherData} data
 * @return {Promise<*>}
 */
async function get_voucher(data) {
    const lastVoucher = data.number || await afip.ElectronicBilling.getLastVoucher(data.salePoint || 1, data.cbteType || 1);
    return await afip.ElectronicBilling.getVoucherInfo(lastVoucher, data.salePoint || 1, data.cbteType || 1);
}

async function get_server_status_AFIP() {
    return await afip.ElectronicBilling.getServerStatus()
}

async function create_voucher(data) {
    await afip.ElectronicBilling.createNextVoucher(data);
}

async function create_PDF(info, app) {
    // info.img1 = base64.base64Sync(`src/documents/${app}.png`);
    info.img2 = base64.base64Sync(`/tmp/Qrs/${app}${info.CbteDesde}.jpeg`);
    info.img3 = base64.base64Sync(`src/documents/apeiron.png`);
    info.img4 = base64.base64Sync(`src/documents/afip-logo.svg`);
    info.items.forEach(item => item.bonificacion *= 100);
    let html = fs.readFileSync("src/documents/facturaA.hbs", "utf8");
    let template = handlebars.compile(html)
    let result = template(info)

    try {
        return await pdfFrom.html(result, {
            useScreenMedia: true,
            format: "A4",
            margin: "1mm",
            width: '210mm',
            height: '297mm'
        });
    } catch (e) {
        console.log(e);
    }
    return undefined;
}

function format(date) {
    date = afip.ElectronicBilling.formatDate(date);
    return date
}

module.exports = {
    create_bill_AFIP,
    get_voucher,
    get_server_status_AFIP,
    format,
    create_PDF,
    getTaxPayerDetailsByCUIT
}
