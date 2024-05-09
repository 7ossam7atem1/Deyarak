const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const propertyRouter = require('./routes/propertyRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const contactRouter = require('./routes/contactRoutes');
const errorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const app = express();

app.use(express.json());

//implementing cors
app.use(cors());
app.options('*', cors());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMS: 60 * 60 * 1000,
  message:
    'too many concurrent requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

app.use('/api/v1/properties', propertyRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/contacts' , contactRouter);
// app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.all('*', (req, res, next) => {
  if (req.originalUrl === '/') {
    next();
  } else {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
  }
});
// app.use('/api/v1/properties', propertyRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });

app.use(errorHandler);
module.exports = app;
