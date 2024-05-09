const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down..');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');
const Database = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(Database)
  .then(() => {
    console.log('DB Connected Successfully');
  });

const port = process.env.PORT || 2000;

const server = app.listen(port, () => {
  console.log(`Application Running on port : ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down..');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
