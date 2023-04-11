const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCurrentUser,
  profileUpdate,
} = require('../controllers/users');
const { validators } = require('../validators/validators');

router.get('/me', getCurrentUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: validators.name.required(),
    email: validators.email.required(),
  }),
}), profileUpdate);

module.exports = router;
