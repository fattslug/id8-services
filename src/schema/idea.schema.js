'use strict';

const mongoose = require('mongoose');
const BusinessArea = require('./businessArea.schema');

let ideaSchema = new mongoose.Schema({
  title: String,
  businessAreas: [BusinessArea.Schema],
  description: String,
  dateSubmitted: Date,
  dateEdited: Date,
  color: String,
  icon: String,
  deleted: Boolean
}, {
  collection: 'ideas'
});

module.exports = mongoose.model('Idea', ideaSchema);