const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middlewares/errorHandler');
const { authRouter, moviesRouter, usersRouter } = require('./routes/index');
const auth = require('./middlewares/auth');
const { logout } = require('./controllers/users');
const NotFoundError = require('./errors/not-found-error');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const { DEV_DB_ADDRESS } = require('./utils/constants');
require('dotenv').config();

const { NODE_ENV, DB_ADDRESS } = process.env;
mongoose.connect(NODE_ENV === 'production' ? DB_ADDRESS : DEV_DB_ADDRESS);

const app = express();

app.use(cors);

app.use(cookieParser());
app.use(express.json());

app.use(requestLogger);

app.use('/', authRouter);

app.use(auth);

app.post('/signout', logout);
app.use('/users', usersRouter);
app.use('/movies', moviesRouter);

app.use((req, res, next) => {
  next(new NotFoundError('Page not found'));
});

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(3000);
