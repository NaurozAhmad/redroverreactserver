import { Router } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import User from './models/user.js';

const route = Router();

route.post('/signup', async (req, res, next) => {
  console.log('Signing up...');
  const salt = crypto.randomBytes(16).toString('hex');

  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send({ message: 'User already exists' });
  }

  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
    if (err) {
      return next(err);
    }

    const user = await User.create({
      email: req.body.email,
      password: hashedPassword,
      salt: salt,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    const token = jwt.sign({ data: req.body.email }, 'secret', { expiresIn: 60 * 60 });

    return res.status(200).send({ token });
  });
});

route.post('/login', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('Logged in');
});

export default route;
