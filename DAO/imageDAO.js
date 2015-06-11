var Image = require('../model').Image;
var gm = require('gm');
var im = gm.subClass({ imageMagick: true });

exports.create = function(imgdata, mime, callback){
  var image = new Image();
  image.img.data = imgdata;
  image.img.contentType = mime;
  im(image.img.data)
  .resize(128)
  .toBuffer('PNG',function (err, buffer) {
    if (err)
      throw err;
    
    image.thumbnail.data = buffer;
    image.save(function(err, image){
    if(!err)
      callback(image);
    });
    
  });
};

exports.update = function(id, imgdata, mime, callback){
  exports.findById(id, function(image){
    image.img.data = imgdata;
    image.img.contentType = mime;
    im(image.img.data)
    .resize(128)
    .toBuffer('PNG',function (err, buffer) {
      if (err)
        throw err;
      
      image.thumbnail.data = buffer;
      image.save(function(err, image){
      if(!err)
        callback(image);
      });
      
    });
  });
};

exports.findById = function(id, callback){
  Image.findById(id, function(err, image){
    if(err) throw err;
    callback(image);
  });
};
