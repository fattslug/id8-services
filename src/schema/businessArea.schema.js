'use strict';

const mongoose = require('mongoose');

let businessAreaSchema = new mongoose.Schema({
  businessAreaID: Number,
  businessAreaName: String
}, {
  collection: 'businessAreas'
});

module.exports = mongoose.model('BusinessArea', businessAreaSchema);