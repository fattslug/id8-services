'use strict';

const mongoose = require('mongoose');
const BusinessArea = require('./businessArea.schema');

let ideaSchema = new mongoose.Schema({
  title: String,
  businessAreas: [BusinessArea.Schema],
  problemDescription: String,
  solutionDescription: String,
  dateSubmitted: Date,
  dateEdited: Date,
  deleted: Boolean
}, {
  collection: 'ideas'
});

module.exports = mongoose.model('Idea', ideaSchema);