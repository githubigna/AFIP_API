
const jwt = require("jsonwebtoken");
const User = require('../models/userSchema')

const authenticate = async (req, res) => {
    try {
        /**
         * checkea que el API public sea correcto
         */
        if (!req.headers.apipublic || req.headers.apipublic !== process.env.API_PUBLIC) {
            res.status(400).json("Authentication failed due to lack or invalid API public key");
        } else {
            /**
             * verifica que usuario quiere autenticar y le provee el token
             * const auth = jwt.sign(`${user[0].secret}`,`${process.env.TOKEN_SECRET}`)
             */
            if (req.body.userName) {
                let name = req.body.userName;

                let user = await User.find({ userName: name });
                if (!user[0].active || user[0].active !== true) {
                    res.status(400).json("Connection rejected due to user status");
                } else {
                    if (user[0]) {
                        if (user[0].secret) {
                            const auth = jwt.sign(`${user[0].secret}`, `${process.env.TOKEN_SECRET}`);
                            if (auth) {
                                res.status(200).json({
                                    "Token": `${auth}`
                                });
                            } else {
                                res.status(400).json("Error in authentication, connection rejected");
                            }
                        } else {
                            res.status(400).json("Connection rejected due to invalid user");
                        }
                    } else {
                        res.status(400).json("Connection rejected, no user found");
                    }
                }
            } else {
                res.status(400).json("Connection rejected due to lack of userName");
            }
        }
    } catch (e) {
        console.log(e);

        res.status(400).json("Connection rejected");
    }
}
module.exports = {
    authenticate
}