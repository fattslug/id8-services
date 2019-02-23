'use strict';

const mongoose = require('mongoose');
const BusinessArea = require('./businessArea.schema');
const User = require('./user.schema');

let ideaSchema = new mongoose.Schema({
  title: String,
  businessAreas: [BusinessArea.Schema],
  description: String,
  dateSubmitted: Date,
  dateEdited: Date,
  color: String,
  icon: String,
  author: User.Schema,
  deleted: Boolean
}, {
  collection: 'ideas'
});

module.exports = mongoose.model('Idea', ideaSchema);