const { authorizationCheck } = require("../helpers/authentication.functions")

const auth = async (req, res, next) => {
    let token = req.headers.authorization;
    try {
        if (token) {
            let value = token.split(" ")[1];
            let authorized = await authorizationCheck(value);
            if (authorized) {
                if(authorized === "User not active"){
                    res.status(400).json("Connection rejected due to user status");
                }else{
                    next()
                }
            } else {
                res.status(400).json("Connection rejected");
            }
        } else {
            res.status(400).json("Connection rejected due to missing token");
        }
    } catch (e) {
        res.status(400).json("Connection rejected");
    }
}

module.exports = {
    auth
}