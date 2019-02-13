'use strict';

const mongoose = require('mongoose');

let businessAreaSchema = new mongoose.Schema({
  name: String,
  deleted: Boolean
}, {
  collection: 'business-areas'
});

exports.Schema = businessAreaSchema;
exports.Model = mongoose.model('BusinessArea', businessAreaSchema);