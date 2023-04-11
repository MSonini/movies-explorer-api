const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createMovie,
  getCurrentUserMovies,
  deleteMovie,
} = require('../controllers/movies');
const {
  validators: {
    string, link, number, objectId,
  },
} = require('../validators/validators');

router.get('/', getCurrentUserMovies);

router.post('/', celebrate({
  body: Joi.object().keys({
    country: string.required(),
    director: string.required(),
    duration: number.required(),
    year: string.required(),
    description: string.required(),
    image: link.required(),
    trailer: link.required(),
    nameRU: string.required(),
    nameEN: string.required(),
    thumbnail: link.required(),
    movieId: string.required(),
  }),
}), createMovie);

router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: objectId.required(),
  }),
}), deleteMovie);

module.exports = router;
