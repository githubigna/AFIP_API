const { AwesomeQR } = require("awesome-qr");
const fs = require("fs");

// ...
async function QR(text, newinfo,app) {
    //let background = fs.readFileSync("");
    
    let buffer = await new AwesomeQR({
        text: text,
        size: 500,
    }).draw();
    const dir = "/tmp/Qrs";
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.writeFileSync(`${dir}/${app}${newinfo.CbteDesde}.jpeg`, buffer);
}
    
module.exports = {
    QR
}