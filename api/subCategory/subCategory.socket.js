/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var SubCategory = require('./subCategory.model');

exports.register = function(socket) {
  SubCategory.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  SubCategory.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('subCategory:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('subCategory:remove', doc);
}