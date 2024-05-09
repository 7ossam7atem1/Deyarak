const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Property = require('../models/propertyModel');

dotenv.config({ path: './config.env' });
const database = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(database, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log('DB Connected Successfully');
  });
const properties = JSON.parse(
  fs.readFileSync(`${__dirname}/property.json`, 'utf8')
);

const importData = async () => {
  try {
    await Property.create(properties);
    console.log('Data Successfully imported');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Property.deleteMany();
    console.log('Data Successfully deleted');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
