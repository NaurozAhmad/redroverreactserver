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

    const token = jwt.sign({ data: req.body.email }, process.env.SECRET || 'secret', { expiresIn: 6 });

    return res.status(200).send({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName } });
  });
});

route.post('/login', async (req, res) => {
  console.log('Logging in...', req.body);
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(401).send({ message: 'Incorrect email or password' });
  }

  crypto.pbkdf2(req.body.password, user.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
    if (err) {
      return res.status(400).send({ message: 'Error logging in' });
    }
    if (!crypto.timingSafeEqual(user.password as any, hashedPassword)) {
      return res.status(401).send({ message: 'Incorrect email or password' });
    }
    const token = jwt.sign({ data: req.body.email }, process.env.SECRET || 'secret', { expiresIn: 6 });

    return res.status(200).send({ token, user: { email: user.email, firstName: user.firstName, lastName: user.lastName }});
  });
});

export default route;
