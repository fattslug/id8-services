'use strict';

const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
  username: String,
  displayName: String,
  role: String,
  authToken: String
}, {
  collection: 'users'
});

exports.Schema = userSchema;
exports.Model = mongoose.model('User', userSchema);