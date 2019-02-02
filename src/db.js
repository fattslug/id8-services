const mongoose = require('mongoose');
const dotenv = require('dotenv');

const chalk = require('chalk');

mongoose.connect(process.env.MONGO_URL, (err) => {
  if (err) {
    console.log(chalk.black.bgRed('Error connecting to database: '), err);
  } else {
    console.log(chalk.green('Successfully connected to MongoDB'));
  }
});

module.exports = mongoose;