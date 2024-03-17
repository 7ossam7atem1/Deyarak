const express = require('express');
const morgan = require('morgan');
const propertyRouter = require('./routes/propertyRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const errorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(errorHandler);
module.exports = app;
