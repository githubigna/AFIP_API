const {Mongoose} = require("mongoose");
const MongoDb = new Mongoose()
const capitalize = require('capitalize');

class mongo {
    // Inicia la base de datos
    async initialize() {
        try {
            let db = await MongoDb.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_CONNECT}@${process.env.MONGO_DB}.ioqfz.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`, {
                useCreateIndex: true,
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true,
            });
            console.log("DB is connected: ", process.env.DATABASE_NAME);
        } catch (err) {
            console.error(err);
        }
    }
}

module.exports = {
    MongoDb,
    mongo
}
