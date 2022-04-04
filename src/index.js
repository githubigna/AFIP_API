const express = require("express");
const methodOverride = require("method-override");
const afip = require("../src/service/afip");
const dotenv = require("dotenv")
const {mongo} = require("./database/mongoDb")
const db = new mongo()
const {checkSVStatus} = require("./middlewares/status")
const path = require('path')
const hbs = require('hbs')
dotenv.config()
// INITIALIZATION

db.initialize()
const app = express();

app.set("port", process.env.PORT || 3000);

// MIDDLEWARES
app.use(methodOverride("_method"));
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({extended: false, limit: '20mb'}));


// ADD HEADERS
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", `*`);
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});
const version = process.env.VERSION;
app.set('views', path.join(__dirname))
app.set('view engine', 'hbs')
app.use(checkSVStatus)
// ROUTES
app.use(`/${version}`, require("./routes/afip_billing"));
app.use(`/${version}/auth`, require("./routes/authentication"));
app.use(`/afip/docs/`, require("./routes/docs"));


// SERVER IS LISTENING
app.listen(app.get("port"), () => {
    console.log("Server on port", app.get("port"));
});

afip.get_server_status_AFIP();
    