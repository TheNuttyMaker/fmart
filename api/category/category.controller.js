'use strict';

var _ = require('lodash');
var Category = require('./category.model');

// Get list of categorys
exports.index = function(req, res) {
  Category.find(function (err, categorys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(categorys);
  });
};

// Get list of parents
exports.parents = function(req, res) {
  // console.log(req.params.id);
  Category.find({'parentId' : parseInt(req.params.id)},function (err, categorys) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(categorys);
  });
};

// Get all categories with corresponding sub_categories
exports.all = function(req, res) {
  var async = require("async");
  var p = [];
  Category.find({parentCategory:0, active:true}).select({name:1,category:1,parentCategory:1, info:1,image:1}).exec(function(err,parents){
  // Using async library which will enable us to wait until data received from database

async.waterfall([
    function(callback) {
        async.each(parents, function(a, callback){
            a = a.toObject();
            Category.find({parentCategory:parseInt(a.category), active:true}).select({name:1,category:1,parentCategory:1,image:1}).exec(function(err,c){
              a.sub_categories = c;
              p.push(a);
              callback();
            });
          },
          function(err){
            if( err ) { return res.status(404).send('Not Found'); } else {  callback(null, p);}
          }
        );
    },
    function(p, callback) {
      var s=[];
      //s.forEach(function(v){  v.sub_categories =[];});
      //console.log("p is "+JSON.stringify(p[10]));
      var count =-1;
      async.whilst(
        function() { return count < p.length-1; },
        function(callback) {
            count++;
            var r = p[count];
            async.each(r.sub_categories, function(d, callback){
                d = d.toObject();  //c = level1
                Category.find({parentCategory:parseInt(d.category), active:true}).select({name:1,category:1,parentCategory:1}).exec(function(err,e){
                  d.leaf_categories = e;    //e = leaf
                  //var obj = {"sub_categories" : d};
                  //console.log("d is "+JSON.stringify(d));
                  //console.log("p is "+JSON.stringify(p[count].sub_categories));
                  s.push(d);     
                  callback();
                });
              },
              function(err){
                if( err ) { return res.status(404).send('Not Found'); } else {  callback(null, p, s);}
              }
            );
        },
        function (err, p, s) {
          let arr=p;
          let q=p;
          console.log("q                                                          is "+ JSON.stringify(q)); 
          for (let i = 0; i < q.length; i++) {
            let a=q[i].sub_categories;
            //console.log(a.length);
            for (let j = 0; j < a.length; j++) {
              let parentCategory = a[j].parentCategory; 
              let obj = {"_id" : arr[i].sub_categories[j]._id, 
              "category" : arr[i].sub_categories[j].category, 
              "name" : arr[i].sub_categories[j].name, 
              "parentCategory" : arr[i].sub_categories[j].parentCategory, 
              "image" : arr[i].sub_categories[j].image, 
              "leaf_categories": []   };
              arr[i].sub_categories[j]= obj;
              for (let k = 0; k < s.length; k++) {
                if(parentCategory === s[k].parentCategory){
                  //y.sub_categories = z.leaf_categories;
                 // console.log(" arr is "+JSON.stringify(arr[i].sub_categories[j]));
                  arr[i].sub_categories[j].leaf_categories.push(s[k].leaf_categories);

                }
              }                
            }              
          }
          //var q=arr;

            callback(null, arr);
        }
    )
        //callback(null, s);
    }
], function (err, result) {
    return res.status(200).send(result);
});





});

};

// Get a single category
exports.show = function(req, res) {
  Category.findById(req.params.id, function (err, category) {
    if(err) { return handleError(res, err); }
    if(!category) { return res.status(404).send('Not Found'); }
    return res.json(category);
  });
};

// Creates a new category in the DB.
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
  Category.create(req.body, function(err, category) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(category);
  });
};

// Updates an existing category in the DB.
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

  Category.findById(req.params.id, function (err, category) {
    if (err) { return handleError(res, err); }
    if(!category) { return res.status(404).send('Not Found'); }
    var updated = _.extend(category, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(category);
    });
  });
};

// Deletes a category from the DB.
exports.destroy = function(req, res) {
  Category.findById(req.params.id, function (err, category) {
    if(err) { return handleError(res, err); }
    if(!category) { return res.status(404).send('Not Found'); }
    category.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}




/*exports.all = function(req, res) {
  var async = require("async");
  var p = [];
  Category.find({parentCategory:0, active:true}).select({name:1,category:1,parentCategory:1}).exec(function(err,parents){
  // Using async library which will enable us to wait until data received from database
  async.each(parents, function(a, callback){
      a = a.toObject();  //a = level0
      Category.find({parentCategory:parseInt(a.category), active:true}).select({name:1,category:1,parentCategory:1}).exec(function(err,c){
          async.each(c, function(d, callback){
              d = d.toObject();  //c = level1
              Category.find({parentCategory:parseInt(d.category), active:true}).select({name:1,category:1,parentCategory:1}).exec(function(err,e){
                d.leaf_categories = e;    //e = leaf
                c.push(d);     
                console.log("found"+ c);   
               });
          },
              function(err){
                if( err ) { console.log('Not Found'); } else { console.info("found"); }
              });
            a.sub_categories = c;
            p.push(a);
            callback();
      });
    },
    // 3rd param is the function to call when everything's done
    function(err){
      if( err ) { return res.status(404).send('Not Found'); } else {   return res.status(200).json(p); }
    }
  );
});

};*/



/*exports.all = function(req, res) {
  var async = require("async");
  var p = [];
  Category.find({parentCategory:0, active:true}).select({name:1,category:1,parentCategory:1}).exec(function(err,parents){
  // Using async library which will enable us to wait until data received from database
  async.each(parents, function(a, callback){
      a = a.toObject();
      Category.find({parentCategory:parseInt(a.category), active:true}).select({name:1,category:1,parentCategory:1}).exec(function(err,c){
        a.sub_categories = c;
        console.log(" c is "+ c);
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

};*/