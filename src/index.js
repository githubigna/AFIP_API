const express = require("express");
const methodOverride = require("method-override");
const afip = require("../src/js/service/afip");


// INITIALIZATION

const app = express();

app.set("port", process.env.PORT || 3000);

// MIDDLEWARES
app.use(methodOverride("_method"));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: false, limit: '20mb' }));

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
    
    // ROUTES
    app.use(require("./js/api/afip_billing"));
    
    
    // SERVER IS LISTENING
    app.listen(app.get("port"), () => {
      console.log("Server on port", app.get("port"));
    });
    
    afip.get_server_status_AFIP();
    