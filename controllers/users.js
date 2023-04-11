const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { default: mongoose } = require('mongoose');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');
const BadRequestError = require('../errors/bad-request-error');
const { DEV_JWT_SECRET } = require('../utils/constants');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Object Not Found');
      }
      res.send({ data: user });
    }).catch(next);
};

module.exports.profileUpdate = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Object Not Found');
      }
      res.send({
        data: {
          _id: user._id, email: user.email, name: user.name,
        },
      });
    }).catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Parameters error'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = async (req, res, next) => {
  const {
    name, password, email,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      data: {
        _id: user._id, email: user.email, name: user.name,
      },
    }))
    .catch((error) => {
      if (error.code === 11000) {
        next(new ConflictError('This email is already taken'));
      } else if (error instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Parameters error'));
      } else {
        next(error);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { password, email } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : DEV_JWT_SECRET,
        { expiresIn: '7d' },
      );
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
          // httpOnly: true,
        })
        .send({ email });
    })
    .catch(next);
};
