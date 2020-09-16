const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;

const User = require('../models/user');

const WithAuth = (req, res, next) => {
    const token = req.headers['token'];

    if (token) {
        jwt.verify(token, secret, async (err, decoded) => {
            if (err)
                res.status(401).json({ error: 'Unauthorized: token invalid' });
            else {
                await User.findOne({ email: decoded.email })
                    .then(user => {
                        if (user) {
                            req.user = user;
                            next();
                        } else {
                            res.status(404).json({ error: 'Unauthorized: token invalid or user not found' });
                        }
                    })
                    .catch(err => {
                        res.status(401).json({ error: err });
                    })
            }
        })
    } else {
        res.status(401).json({ error: 'Unauthorized: no token provided' });
    }
}

module.exports = WithAuth;