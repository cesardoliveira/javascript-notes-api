const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;

const User = require('../models/user');

const WithAuth = (req, res, next) => {
    const token = req.headers['token'];
    if (!token) {
        res.status(481).json({ error: 'Unauthorized: token not provided. ' });
    } else {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) {
                res.status(401).json({ error: 'Unauthorized: token invalid or expired. ' });
            }
            else {
                User.findOne({ email: decoded.email }).then(user => {
                    req.user = user;
                    next();
                }).catch(error => {
                    res.status(401).json({ error: error });
                })
            }
        })
    }
}

module.exports = WithAuth;