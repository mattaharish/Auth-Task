const Token = require('./../models/Token');

let jwt = require('jsonwebtoken');

module.exports.auth = (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, 'edwisor', function (err, decoded) {
            if (err) {
                res.send("Authentication Failed !");
            } else {
                Token.findOne({
                    'token': token
                }, (err, result) => {
                    if (err) {
                        res.send(err);
                    } else if (result == null) {
                        res.send("No Token Found!");
                    } else {
                        if (result.active) {
                            req.user = decoded;
                            next();
                        } else {
                            res.send("Token Expired!");
                        }
                    }
                });
            }
        });
    } else {
        res.send('No token provided.');
    }
};