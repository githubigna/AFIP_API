
const moment = require('moment');
const afip = require("../service/afip")

const checkSVStatus = async (req, res, next) => {
    let info = await afip.get_server_status_AFIP();
    info["resolve"] = [];
    info["observacion"] = [];
    if (!info.AppServer || !info || info.AppServer !== "OK") {
        info.observacion.push("AppServer is presenting some issues.");
        info.resolve.push(1);
    }
    if (!info.DbServer || !info || info.DbServer !== "OK") {
        info.observacion.push("DbServer is presenting some issues.");
        info.resolve.push(2);
    }
    if (!info.AuthServer || !info || info.AuthServer !== "OK") {
        info.observacion.push("AuthServer is presenting some issues.");
        info.resolve.push(3);
    }
    if (info.AppServer === "OK" && info.DbServer === "OK" && info.AuthServer === "OK") {
        info.observacion.push("OK");
    }
    if (info.resolve.length !== 0) {
        res.status(500).json(info);
    } else {
        next()
    }
}
module.exports = {
    checkSVStatus
}