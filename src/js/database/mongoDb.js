const mongoose = require("mongoose");
const capitalize = require('capitalize');

class MongoDb {
    // Inicia la base de datos
    async initialize() {
    try {
        await mongoose.connect( /*mongo connect*/  {
        useCreateIndex: true,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        });
        console.log("DB is connected");
    } catch (err) {
        console.error(err);
    }
    }
}
module.exports = MongoDb;