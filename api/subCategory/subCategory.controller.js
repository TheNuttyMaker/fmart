'use strict';

var _ = require('lodash');
var SubCategory = require('./subCategory.model');

// Get list of subCategorys
exports.index = function(req, res) {
  SubCategory.find(function (err, subCategorys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(subCategorys);
  });
};

// Get list of parents
exports.parents = function(req, res) {
  // console.log(req.params.id);
  SubCategory.find({'parentId' : parseInt(req.params.id)},function (err, subCategorys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(subCategorys);
  });
};

// Get all categories with corresponding sub_categories
exports.all = function(req, res) {
  var async = require("async");
  var p = [];
  SubCategory.find({parentCategory:0, active:true}).select({name:1,subCategory:1,parentCategory:1}).exec(function(err,parents){
  // Using async library which will enable us to wait until data received from database
  async.each(parents, function(a, callback){
      a = a.toObject();
      SubCategory.find({parentCategory:parseInt(a.subCategory), active:true}).select({name:1,subCategory:1,parentCategory:1}).exec(function(err,c){
        a.sub_categories = c;
        p.push(a);
        callback();
      });
    },
    // 3rd param is the function to call when everything's done
    function(err){
      if( err ) { return res.status(404).send('Not Found'); } else { return res.status(200).json(p); }
    }
  );
});

};

// Get a single subCategory
exports.show = function(req, res) {
  SubCategory.findById(req.params.id, function (err, subCategory) {
    if(err) { return handleError(res, err); }
    if(!subCategory) { return res.status(404).send('Not Found'); }
    return res.json(subCategory);
  });
};

// Creates a new subCategory in the DB.
exports.create = function(req, res) {
  req.body.uid = req.user.email; // id change on every login hence email is used
  req.body.updated = Date.now();
/*  if(!req.body.slug && req.body.name)
  req.body.slug = req.body.name.toString().toLowerCase()
                      .replace(/\s+/g, '-')        // Replace spaces with -
                      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
                      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
                      .replace(/^-+/, '')          // Trim - from start of text
                      .replace(/-+$/, '');*/
  SubCategory.create(req.body, function(err, subCategory) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(subCategory);
  });
};

// Updates an existing subCategory in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  req.body.uid = req.user.email; // id changes on every login hence email is used
  req.body.updated = Date.now();
/*  if(!req.body.slug && req.body.name)
  req.body.slug = req.body.name.toString().toLowerCase()
                      .replace(/\s+/g, '-')        // Replace spaces with -
                      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
                      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
                      .replace(/^-+/, '')          // Trim - from start of text
                      .replace(/-+$/, '');*/

  SubCategory.findById(req.params.id, function (err, subCategory) {
    if (err) { return handleError(res, err); }
    if(!subCategory) { return res.status(404).send('Not Found'); }
    var updated = _.extend(subCategory, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(subCategory);
    });
  });
};

// Deletes a subCategory from the DB.
exports.destroy = function(req, res) {
  SubCategory.findById(req.params.id, function (err, subCategory) {
    if(err) { return handleError(res, err); }
    if(!subCategory) { return res.status(404).send('Not Found'); }
    subCategory.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
