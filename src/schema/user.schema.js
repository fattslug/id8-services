'use strict';

const mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: String,
    displayName: String,
    role: String
}, {
  collection: 'users'
});

module.exports = mongoose.model('User', userSchema);