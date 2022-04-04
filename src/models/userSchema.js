const {MongoDb} = require("../database/mongoDb"); 
const userSchema = new MongoDb.Schema({
    userName: {
        type: String,
        require: true,
    },
    secret: {
        type: String,
        require: true,
    },
    active:{
        type:Boolean,
        require:true,
        default:false,
    }
});

module.exports = MongoDb.model('User', userSchema);