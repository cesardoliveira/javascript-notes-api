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

        let userByEmail = await User.findOne({ email: email });
        if (userByEmail) {
            res.status(401).json({ error: 'That email is taken. Try another.' });
        } else {

            const user = new User({ name, email, password });
            await user.save();
            res.status(200).json(user);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error registering new user.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email: email });
        if (user) {
            user.isCorrectPassword(password, function (err, same) {
                if (same) {
                    const token = jwt.sign({ email }, secret, { expiresIn: '10d' });
                    res.status(200).json({ user: user, token: token });
                } else {
                    res.status(401).json({ error: 'Wrong password. Try again.' });
                }
            })
        } else {
            res.status(401).json({ error: "Couldn't find your e-mail." });
        }
    } catch (error) {
        res.status(500).json({ error: 'Interval error, please try again.' });
    }
});

router.put('/', withAuth, async (req, res) => {
    try {
        const { name, email } = req.body;

        let user = await User.findOne({ email: email });
        if (user) {
            if (isOwner(user, req.user)) {
                let user = await User.findOneAndUpdate(
                    { _id: req.user._id },
                    { $set: { name: name, email: email, update_at: Date.now() } },
                    { upsert: true, 'new': true }
                )
                res.status(200).json(user);
            } else {
                res.status(401).json({ error: 'That email is taken. Try another.' });
            }
        } else {
            let user = await User.findOneAndUpdate(
                { _id: req.user._id },
                { $set: { name: name, email: email, update_at: Date.now() } },
                { upsert: true, 'new': true }
            )
            res.status(200).json(user);
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Unable to update a user.' });
    }
});

router.put('/password', withAuth, async (req, res) => {
    const { password } = req.body;

    try {
        let user = await User.findOne({ _id: req.user._id })
        user.password = password;
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Unable to update a user password.' });
    }
});

router.delete('/', withAuth, async (req, res) => {
    try {
        let user = await User.findOne({ _id: req.user._id });
        await user.delete();
        res.status(200).json({ success: `User deleted.` });
    } catch (error) {
        res.status(500).json({ error: 'Unable to delete a user.' });
    }
});

router.get('/', async (req, res) => {
    try {
        let users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Unable to get users.' });
    }
});

const isOwner = (userDB, userLogged) => {
    console.log(userDB)
    console.log(userLogged)
    return (JSON.stringify(userDB._id) == JSON.stringify(userLogged._id));
};

module.exports = router;