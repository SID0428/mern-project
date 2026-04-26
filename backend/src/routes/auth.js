const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

function signToken(admin) {
  return jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.create({ name, email, password });
    const token = signToken(admin);
    return res.status(201).json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An admin with this email already exists.' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(admin);
    return res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;
