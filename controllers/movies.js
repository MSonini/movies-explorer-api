const { default: mongoose } = require('mongoose');
const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports.getCurrentUserMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id }).then((movies) => {
    if (!movies) {
      throw new NotFoundError('Object Not Found');
    }
    res.send({ data: movies });
  }).catch(next);
};

module.exports.createMovie = (req, res, next) => {
  Movie.create({ ...req.body, owner: req.user._id })
    .then((movie) => {
      Movie.populate(movie, { path: 'owner' }).then((populatedMovie) => {
        res.send({ data: populatedMovie });
      }).catch(next);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Parameters error'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId).populate(['owner'])
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Object Not Found');
      }
      const userId = req.user._id;
      const ownerId = movie.owner._id;
      if (userId !== ownerId.toString()) {
        throw new ForbiddenError('Not allowed');
      } else {
        Movie.deleteOne({ _id: movie._id }).then(({ deletedCount }) => {
          if (deletedCount === 0) {
            throw new BadRequestError('Deletion error');
          } else {
            res.send({ data: movie });
          }
        }).catch(next);
      }
    })
    .catch((error) => {
      if (error instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Invalid id'));
      } else {
        next(error);
      }
    });
};
