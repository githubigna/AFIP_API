const Afip = require('@afipsdk/afip.js');
const e = require('express');
const pdf = require('pdf-creator-node');
const fs = require('fs');
const date = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
const moment = require("moment")
let dataReferencia = {
	'CantReg' 		: 1, // Cantidad de comprobantes a registrar
	'PtoVta' 		: 1, // Punto de venta
	'CbteTipo' 		: 6, // Tipo de comprobante (ver tipos disponibles) 
	'Concepto' 		: 1, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios
	'DocTipo' 		: 80, // Tipo de documento del comprador (ver tipos disponibles)
	'DocNro' 		: 20111111112, // Numero de documento del comprador
	'CbteDesde' 	: 1, // Numero de comprobante o numero del primer comprobante en caso de ser mas de uno
	'CbteHasta' 	: 1, // Numero de comprobante o numero del ultimo comprobante en caso de ser mas de uno
	'CbteFch' 		: parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
	'ImpTotal' 		: 184.05, // Importe total del comprobante
	'ImpTotConc' 	: 0, // Importe neto no gravado
	'ImpNeto' 		: 150, // Importe neto gravado
	'ImpOpEx' 		: 0, // Importe exento de IVA
	'ImpIVA' 		: 26.25, //Importe total de IVA
	'ImpTrib' 		: 7.8, //Importe total de tributos
	'FchServDesde' 	: null, // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
	'FchServHasta' 	: null, // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
	'FchVtoPago' 	: null, // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
	'MonId' 		: 'PES', //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos) 
	'MonCotiz' 		: 1, // Cotización de la moneda usada (1 para pesos argentinos)  
	'CbtesAsoc' 	: [ // (Opcional) Comprobantes asociados
			{
			'Tipo' 		: 6, // Tipo de comprobante (ver tipos disponibles) 
			'PtoVta' 	: 1, // Punto de venta
			'Nro' 		: 1, // Numero de comprobante
			'Cuit' 		: 20111111112 // (Opcional) Cuit del emisor del comprobante
			}
		],
	'Tributos' 		: [ // (Opcional) Tributos asociados al comprobante
		{
			'Id' 		:  99, // Id del tipo de tributo (ver tipos disponibles) 
			'Desc' 		: 'Ingresos Brutos', // (Opcional) Descripcion
			'BaseImp' 	: 150, // Base imponible para el tributo
			'Alic' 		: 5.2, // Alícuota
			'Importe' 	: 7.8 // Importe del tributo
		}
	], 
	'Iva' 			: [ // (Opcional) Alícuotas asociadas al comprobante
		{
			'Id' 		: 5, // Id del tipo de IVA (ver tipos disponibles) 
			'BaseImp' 	: 100, // Base imponible
			'Importe' 	: 21 // Importe 
		}
	], 
	'Opcionales' 	: [ // (Opcional) Campos auxiliares
		{
			'Id' 		: 17, // Codigo de tipo de opcion (ver tipos disponibles) 
			'Valor' 	: 2 // Valor 
		}
	], 
	'Compradores' 	: [ // (Opcional) Detalles de los clientes del comprobante 
		{
			'DocTipo' 		: 80, // Tipo de documento (ver tipos disponibles) 
			'DocNro' 		: 20111111112, // Numero de documento
			'Porcentaje' 	: 100 // Porcentaje de titularidad del comprador
		}
	]
};
/** (1)  CODIGOS DE DOCUMENTOS 
 * -----------------------
 *
0	CI Policía Federal
1	CI Buenos Aires
2	CI Catamarca
3	CI Córdoba
4	CI Corrientes
5	CI Entre Ríos
6	CI Jujuy
7	CI Mendoza
8	CI La Rioja
9	CI Salta
10	CI San Juan
11	CI San Luis
12	CI Santa Fe
13	CI Santiago del Estero
14	CI Tucumán
16	CI Chaco
17	CI Chubut
18	CI Formosa
19	CI Misiones
20	CI Neuquén
21	CI La Pampa
22	CI Río Negro
23	CI Santa Cruz
24	CI Tierra del Fuego
80	CUIT
86	CUIL
87	CDI
89	LE
90	LC
91	CI extranjera
92	en trámite
93	Acta nacimiento
94	Pasaporte
95	CI Bs. As. RNP
96	DNI
99	Sin identificar/venta global diaria
30	Certificado de Migración
88	Usado por Anses para Padrón

 * 
 */

//-----------------------------------------------------------------------------------

/** (2) CODIGOS DE MONEDA
 * 
000	OTRAS MONEDAS 
PES 	PESOS 
DOL 	Dólar ESTADOUNIDENSE 
´002	Dólar EEUU LIBRE 
003	FRANCOS FRANCESES 
004	LIRAS ITALIANAS 
005	PESETAS 
006	MARCOS ALEMANES 
007	FLORINES HOLANDESES 
008	FRANCOS BELGAS 
009	FRANCOS SUIZOS 
010	PESOS MEJICANOS 
011	PESOS URUGUAYOS 
012	REAL 
013	ESCUDOS PORTUGUESES 
014	CORONAS DANESAS 
015	CORONAS NORUEGAS 
016	CORONAS SUECAS 
017	CHELINES AUTRIACOS 
018	Dólar CANADIENSE 
019	YENS 
021	LIBRA ESTERLINA 
022	MARCOS FINLANDESES 
023	BOLIVAR (VENEZOLANO)
024	CORONA CHECA 
025	DINAR (YUGOSLAVO) 
026	Dólar AUSTRALIANO 
027	DRACMA (GRIEGO) 
028	FLORIN (ANTILLAS HOLA 
029	GUARANI 
030	SHEKEL (ISRAEL) 
031	PESO BOLIVIANO 
032	PESO COLOMBIANO 
033	PESO CHILENO 
034	RAND (SUDAFRICANO)
035	NUEVO SOL PERUANO 
036	SUCRE (ECUATORIANO) 
040	LEI RUMANOS 
041	DERECHOS ESPECIALES DE GIRO 
042	PESOS DOMINICANOS 
043	BALBOAS PANAMEÑAS 
044	CORDOBAS NICARAGÛENSES 
045	DIRHAM MARROQUÍES 
046	LIBRAS EGIPCIAS 
047	RIYALS SAUDITAS 
048	BRANCOS BELGAS FINANCIERAS
049	GRAMOS DE ORO FINO 
050	LIBRAS IRLANDESAS 
051	Dólar DE HONG KONG 
052	Dólar DE SINGAPUR 
053	Dólar DE JAMAICA 
054	Dólar DE TAIWAN 
055	QUETZAL (GUATEMALTECOS) 
056	FORINT (HUNGRIA) 
057	BAHT (TAILANDIA) 
058	ECU 
059	DINAR KUWAITI 
060	EURO 
061	ZLTYS POLACOS 
062	RUPIAS HINDÚES 
063	LEMPIRAS HONDUREÑAS 
064	YUAN (Rep. Pop. China)

 */

//-----------------------------------------------------------------------------------

/** (3) CODIGO DE IVA 
0	No Corresponde
1	No Gravado
2	Exento
3	0%
4	10,50%
5	21%
6	27%
7	Gravado
8	5%
9	2,50%
 * 
 */

//-----------------------------------------------------------------------------------
/**
 * poner cuit de Apeiron
 */
const afip = new Afip({ CUIT: 20409447008 });
/**
 * esto iria el llamado en la ruta de la API nueva.
 */
async function create_bill_AFIP (data){
	let info = await  get_billing_info_AFIP(data);
	let voucher = await create_voucher_AFIP(info);
	let documento = data.DocNro;
	voucher = await get_tax_payer_details(voucher,documento);
	let fechaVen = afip.ElectronicBilling.formatDate(voucher.FchVto);
	voucher.FchVto = fechaVen; 
	let obs = voucher.Observaciones.Obs[0].Msg;
	voucher.Observaciones = obs
	//let client_data =  await afip.RegisterScopeThirteen.getTaxpayerDetails(data.DocNro)
	
	return voucher;
}
//-----------------------------------------------------//
function merge_data_for_bill(voucher,client_data){
	let tipo = client_data.tipoPersona
	let tax_payer_details;
	if(tipo ==  "JURIDICA"){
		tax_payer_details = {
			tipo_persona :client_data.tipoPersona,
			id : client_data.idPersona,
			id_type : client_data.tipoClave,
			document : client_data.idActividadPrincipal,
			forma_juridica : client_data.formaJuridica,
			razonSocial : client_data.razonSocial,
			activity : client_data.descripcionActividadPrincipal,
			adres_info :{
				adress : client_data.domicilio[0].direccion,
				postal_code : client_data.domicilio[0].codigoPostal,
				province : client_data.domicilio[0].descripcionProvincia,
				adress_type : client_data.domicilio[0].tipoDomicilio
			},
		}
	} else if(tipo ==  "FISICA"){
		let razonSocial = client_data.nombre + " " + client_data.apellido
		tax_payer_details = {
			tipo_persona :client_data.tipoPersona,
			id : client_data.idPersona,
			id_type : client_data.tipoClave,
			document : client_data.numeroDocumento,
			forma_juridica : client_data.tipoDocumento,
			razonSocial : razonSocial ,
			activity : client_data.descripcionActividadPrincipal,
			adres_info :{
				adress : client_data.domicilio[0].direccion,
				postal_code : client_data.domicilio[0].codigoPostal,
				province : client_data.domicilio[0].descripcionProvincia,
				adress_type : client_data.domicilio[0].tipoDomicilio
			},
		}
	}
voucher["tax_payer_details"] = tax_payer_details
return voucher;
}
//-----------------------------------------------------//
async function get_CUIT_from_DNI (dni){
	let res = await afip.RegisterScopeThirteen.getTaxIDByDocument(dni);	
}
//-----------------------------------------------------//

async function get_billing_info_AFIP(client_data){
	let info = {
	PtoVta 					: client_data.PtoVta, 
	DocTipo					: client_data.DocTipo, // PUNTO (1) -------------->
	DocNro					: client_data.DocNro,
	ImpTotal				: client_data.ImpTotal,
	ImpNeto					: client_data.ImpNeto,
	ImpIVA					: client_data.ImpIVA,
	FchServDesde			: client_data.FchServDesde,
	FchServHasta			: client_data.FchServHasta,
	FchVtoPago 				: client_data.FchVtoPago,
	MonId 					: client_data.MonId, //PUNTO (2) ---------->
	MonCotiz				: client_data.MonCotiz, //COTIZACION DE LA MONEDA PUESTA PES - 1
	Iva : [{
		Id					: client_data.Iva[0].Id, // PUNTO (3) ---------->
		BaseImp				: client_data.Iva[0].BaseImp, // MONTO TOTAL (BRUTO);
		Importe				: client_data.Iva[0].Importe // 21% DEL TOTAL (IVA COBRADO);
	}]
}
return info;
}

async function create_voucher_AFIP(info){
	const lastVoucher = await afip.ElectronicBilling.getLastVoucher(1,1);
	let cbteNumero = lastVoucher + 1;
	let data = {
		'CantReg' 		: 1, // Cantidad de comprobantes a registrar TODO
		'PtoVta' 		: info.PtoVta, // Punto de venta// DEL PROCESO
		'CbteTipo' 		: 1, // Tipo de comprobante (ver tipos disponibles) 
		'Concepto' 		: 2, // Concepto del Comprobante: (1)Productos, (2)Servicios, (3)Productos y Servicios TODO
		'DocTipo' 		: info.DocTipo, // Tipo de documento del comprador (ver tipos disponibles)
		'DocNro' 		: info.DocNro, // Numero de documento del comprador
		'CbteDesde' 	: cbteNumero, // Numero de comprobante o numero del primer comprobante en caso de ser mas de uno TODO
		'CbteHasta' 	: cbteNumero, // Numero de comprobante o numero del ultimo comprobante en caso de ser mas de uno TODO
		'CbteFch' 		: parseInt(date.replace(/-/g, '')), // (Opcional) Fecha del comprobante (yyyymmdd) o fecha actual si es nulo
		'ImpTotal' 		: info.ImpTotal, // Importe total del comprobante
		'ImpTotConc' 	: 0, // Importe neto no gravado TODO 
		'ImpNeto' 		: info.ImpNeto, // Importe neto gravado
		'ImpOpEx' 		: 0, // Importe exento de IVA TODO
		'ImpIVA' 		: info.ImpIVA, //Importe total de IVA
		'ImpTrib' 		: 0, //Importe total de tributos TODO 
		'FchServDesde' 	: info.FchServDesde, // (Opcional) Fecha de inicio del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
		'FchServHasta' 	: info.FchServHasta, // (Opcional) Fecha de fin del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
		'FchVtoPago' 	: info.FchVtoPago, // (Opcional) Fecha de vencimiento del servicio (yyyymmdd), obligatorio para Concepto 2 y 3
		'MonId' 		: `${info.MonId}`, //Tipo de moneda usada en el comprobante (ver tipos disponibles)('PES' para pesos argentinos) 
		'MonCotiz' 		: info.MonCotiz, // Cotización de la moneda usada (1 para pesos argentinos)

		'Iva' 			: [ // (Opcional) Alícuotas asociadas al comprobante
		{
			'Id' 		: info.Iva[0].Id, // Id del tipo de IVA (ver tipos disponibles) 
			'BaseImp' 	: info.Iva[0].BaseImp, // Base imponible
			'Importe' 	: info.Iva[0].Importe // Importe 
		}
		],
	};
	// afip.ElectronicBilling.createVoucher(data).then(async res => {
	// 	let voucherInfo = await afip.ElectronicBilling.getVoucherInfo(cbteNumero,1,1);
	// 	console.log("respuesta ",voucherInfo)
	// 	return voucherInfo;
	// });
	await create_voucher(data);
	let voucherInfo = await get_voucher_info(cbteNumero);
	return voucherInfo;
	
}
async function get_tax_payer_details(voucher,documento){
	//await get_CUIT_from_DNI (documento.dni)
	let taxpayerDetails13 = await afip.RegisterScopeThirteen.getTaxpayerDetails(documento);
	//let taxpayerDetails4 = await afip.RegisterScopeFour.getTaxpayerDetails(documento);
	if(taxpayerDetails13){
		taxpayerDetails13 = merge_data_for_bill(voucher,taxpayerDetails13)
	}
	return taxpayerDetails13;
}
async function get_last_voucher(){
	const lastVoucher = await afip.ElectronicBilling.getLastVoucher(1,1);
	const voucherInfo = await afip.ElectronicBilling.getVoucherInfo(lastVoucher,1,1);
	return voucherInfo;
}
async function get_server_status_AFIP(){
	const serverStatus = await afip.ElectronicBilling.getServerStatus();
	console.log('Este es el estado del servidor:');
	console.log(serverStatus);
}
async function create_voucher(data){
	await afip.ElectronicBilling.createVoucher(data);
}
async function get_voucher_info(cbteNumero){
	let voucherInfo = await afip.ElectronicBilling.getVoucherInfo(cbteNumero,1,1);
	return voucherInfo;
}
async function create_PDF(info){
	
	info.img1 = '../../documents/hola.jpeg';
	info.img2 = '../../documents/Image1.png';
	

	var html = fs.readFileSync("src/documents/factura_A.html", "utf8");
var options = {
format: "A3",
orientation: "portrait",
border: "10mm",
footer: {
	height: "28mm",
	contents: {
		first: 'Cover page',
		2: 'Second page', // Any page number is working. 1-based index
		default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
		last: 'Last Page'
	}
}
};
var document = {
html: html,
data:info,
path: "./output.pdf",
type: "",
};
pdf.create(document, options)
.then((res) => {
console.log("PDF! ->",res);
})
.catch((error) => {
console.error(error);
});
}

function format(date){
	date = afip.ElectronicBilling.formatDate(date);
	return date
}

module.exports = {
	get_tax_payer_details,
	create_bill_AFIP,
	get_last_voucher,
	get_server_status_AFIP,
	format,
	create_PDF
}