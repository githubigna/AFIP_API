const {MongoDb} = require("../database/mongoDb");
const billSchema = new MongoDb.Schema({
    app: {
        type: MongoDb.Schema.Types.ObjectId,
        ref: "users",
    },
    cbte: {
        type: Number,
        require: true,
    },
    salePoint: {
        type: Number,
        required: true,
    },
    cbteType: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        require: true,
    },
    cae: {
        type: String,
    },
    dcto: {
        type: String,
        require: true,
    },
    factura: {
        type: Buffer,
        require: true,
    }
});

module.exports = MongoDb.model('Bill', billSchema);