'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri : 'mongodb://pygold:14021992@ds163940.mlab.com:63940/finemart'
    //uri: 'mongodb://localhost/Grofers'
  },

  seedDB: true
};

//mongodb://<dbuser>:<dbpassword>@ds163940.mlab.com:63940/finemart