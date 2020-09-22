var express = require('express');
var router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;
const withAuth = require('../middlewares/auth');

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password });
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error registering new user. ' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            user.isCorrectPassword(password, function (err, same) {
                if (same) {
                    const token = jwt.sign({ email }, secret, { expiresIn: '10d' });
                    res.status(200).json({ user: user, token: token });
                } else {
                    res.status(401).json({ error: 'Wrong password. Try again or click Forgot password to reset it. ' });
                }
            })
        } else {
            res.status(401).json({ error: "Couldn't find your e-mail. " });
        }
    } catch (error) {
        res.status(500).json({ error: 'Interval error, please try again. ' });
    }
});

router.put('/password', withAuth, async (req, res) => {
    const { password } = req.body;

    try {
        let user = await User.findOne({ _id: req.user._id })

        if (user) {
            if (isOwner(req.user, user)) {
                user.password = password;
                await user.save();
                res.status(200).json(user);
            } else {
                res.status(403).json({ error: 'Permission denied to update this user. ' });
            }
        } else {
            res.status(404).json({ error: `User id: ${id} was not found. ` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to update a user password. ' });
    }
});

router.put('/:id', withAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        let user = await User.findById(id);
        if (user) {
            if (isOwner(req.user, user)) {
                let user = await User.findOneAndUpdate(
                    { _id: id },
                    { $set: { name: name, email: email, updated_at: Date.now() } },
                    { upsert: true, 'new': true }
                );
                res.status(200).json(user);
            } else {
                res.status(403).json({ error: 'Permission denied to update this user. ' });
            }
        } else {
            res.status(404).json({ error: `User id: ${id} was not found. ` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to update a user. ' });
    }
});

router.delete('/:id', withAuth, async (req, res) => {
    try {
        const { id } = req.params;

        let user = await User.findById(id);
        if (user) {
            if (isOwner(req.user, user)) {
                await User.findOneAndDelete(
                    { _id: id }
                );
                res.status(200).json({ sucess: `User id: ${id} was deleted. ` });
            } else {
                res.status(403).json({ error: 'Permission denied to delete this user. ' });
            }
        } else {
            res.status(404).json({ error: `User id: ${id} was not found. ` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete a user. ' });
    }
});

const isOwner = (userReq, userDB) => {
    return (JSON.stringify(userReq._id) == JSON.stringify(userDB._id));
};

module.exports = router;