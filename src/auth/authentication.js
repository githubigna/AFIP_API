const jwt = require("jsonwebtoken");
const User = require('../models/userSchema')

async function authenticate (req,res){
        try{
            /**
             * checkea que el API public sea correcto
             */
            if(!req.headers.apipublic || req.headers.apipublic !== process.env.API_PUBLIC){
                res.status(400).json({
                    "Status":400,
                    "Message":"Authentication failed due to lack or invalid API public key"
                });
            }else{
                /**
                 * verifica que usuario quiere autenticar y le provee el token
                 * const auth = jwt.sign(`${user[0].secret}`,`${process.env.TOKEN_SECRET}`)
                 */
                if(req.body.userName){
                let name = req.body.userName;
                let user;
                user  = await User.find({userName:name});
                    if(user[0]){
                        if(user[0].secret){
                            const auth = jwt.sign(`${user[0].secret}`,`${process.env.TOKEN_SECRET}`);
                            if(auth){
                                res.status(200).json({
                                    "Status":200,
                                    "Token":`${auth}`
                                });
                            }else{
                                res.status(400).json({
                                    "Status":400,
                                    "Message":"Error in authentication, connection rejected"
                                });
                            }
                        }else{
                            res.status(400).json({
                                "Status":400,
                                "Message":"Connection rejected due to invalid user"
                            });
                        }
                    }else{
                        res.status(400).json({
                            "Status":400,
                            "Message":"Connection rejected due to lack of userName"
                        });
                    }
                }else{
                    res.status(400).json({
                        "Status":400,
                        "Message":"Connection rejected due to lack of userName"
                    });
                }
            }
        }catch(e){
            console.log(e);
            res.status(400).json({
                "Status":400,
                "Message":"Connection rejected",
                "Error":e
            });
        }
    }


module.exports = {
    authenticate
}