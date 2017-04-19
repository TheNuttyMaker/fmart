'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SubCategorySchema = new Schema({
  name: String,
 // slug: String,
  info: String,
  categoryID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
  image: String,
  uid: String,
  subCategoryID: Number,
  active: { type: Boolean, default: true },
  updated: {type: Date, default: Date.now},
  products: [{type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'}]
});

/*var SubCategorySchema = new Schema({
  name: String,
 // slug: String,
  info: String,
  parentCategory: Number,
  image: String,
  uid: String,
  category: Number,
  active: { type: Boolean, default: true },
  updated: {type: Date, default: Date.now},
  sub_categories: [{}]
});*/

module.exports = mongoose.model('SubCategory', SubCategorySchema);
