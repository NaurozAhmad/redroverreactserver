import { Router } from 'express';
import passport from 'passport';
import crypto from 'crypto';

import User from './models/user';

const route = Router();

route.post('/signup', async (req, res, next) => {
  const salt = crypto.randomBytes(16).toString('hex');

  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function (err, hashedPassword) {
    if (err) {
      return next(err);
    }

    const user = await User.create({
      username: req.body.username,
      password: hashedPassword,
      salt: salt,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    });

    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });

  const { username, password } = req.body;
  const user = new User({ username: username, password: password });
  await user.save();
  res.status(200).send();
});

route.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

export default route;
