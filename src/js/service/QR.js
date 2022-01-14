const { AwesomeQR } = require("awesome-qr");
const fs = require("fs");

// ...
async function QR(text, newinfo,app) {
    //let background = fs.readFileSync("");
    
    let buffer = await new AwesomeQR({
        text: text,
        size: 500,
    }).draw();
    
    fs.writeFileSync(`src/Qrs/${app}${newinfo.CbteDesde}.jpeg`, buffer);
}
    
module.exports = {
    QR
}