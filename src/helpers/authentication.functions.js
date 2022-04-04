const User = require('../models/userSchema')
const jwt = require("jsonwebtoken");

async function authorizationCheck(token) {
    if (token) {
        let validation;
        try {
            validation = jwt.verify(`${token}`, `${process.env.TOKEN_SECRET}`)
        } catch (e) {
            console.log("Error verificando token: ", e);
            return false
        }
        let user;
        user = await User.find({ secret: validation }).then().catch((e) => console.log("error", e));
        if (!user[0].active || user[0].active !== true) {
            return "User not active"
        }
        return user.length > 0;
    } else {
        return false
    }
}
async function decodeJwt(token){
    return jwt.verify({token}, `${process.env.TOKEN_SECRET}`);
}
module.exports = {
    authorizationCheck,
    decodeJwt
}