const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const { validationResult } = require('express-validator');

const router = express.Router();

router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'User already exists' });

    const password_hash = await bcrypt.hash(password, 12);
    const newUser = new User({ email, password_hash });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    next(err);
  }
});

router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
