'use strict';

const mongoose = require('mongoose');

let ideaSchema = new mongoose.Schema({
  title: String,
  description: String,
  businessAreaID: Number,
  businessAreaName: String,
  dateSubmitted: Date,
  dateEdited: Date,
  deleted: Boolean
}, {
  collection: 'ideas'
});

module.exports = mongoose.model('Idea', ideaSchema);