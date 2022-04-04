const fs = require("fs")
const path = require("path")
/**
 * Funcion que lee la carpeta pdf, busca todos los archivos .pdf y uno a uno los elimina,
 * luego de que corra esta función, el único pdf que permanece en la carpeta es el que se creo con este pedido a la api.
 * Que luego será eliminado.
 */
function deleteAllPdfs(app, CbteDesde) {
    try {
        const dir = "/tmp/Pdfs"
        if (fs.existsSync(dir)) {
            let files = fs.readdirSync('/tmp/Pdfs');
            if (!files) {
                return
            }
            const pdfFiles = files.filter(el => path.extname(el) === '.pdf')
            pdfFiles.forEach(file => {
                if (path.toNamespacedPath(file).includes(app)) {

                    let filename = dir + "/" + file;
                    try {
                        fs.unlinkSync(filename);
                        console.log("Eliminando este archivo -> ", file);
                    } catch (e) {
                        console.log("Error", e);
                    }
                } else {
                }
            });
        }
    } catch (e) {
    }
}
async function init() {
    await sleep(1000);
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
module.exports = {
    deleteAllPdfs
}