var express = require('express');
var router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.JWT_TOKEN;

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error registering new user. ' });
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
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
})

module.exports = router;
