'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
  category: Number,
  name: String,
 // slug: String,
  parentCategory: Number,
  info: String,
  image: String,
  
  active: { type: Boolean, default: true },

});

module.exports = mongoose.model('Category', CategorySchema);
