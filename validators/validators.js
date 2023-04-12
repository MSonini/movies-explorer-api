const { Joi } = require('celebrate');
const { URL_REGEX } = require('../utils/constants');

module.exports.validators = {
  email: Joi.string().email(),
  password: Joi.string(),
  name: Joi.string().min(2).max(30),
  link: Joi.string().regex(URL_REGEX),
  objectId: Joi.string().length(24).hex(),
  string: Joi.string(),
  number: Joi.number(),
};
