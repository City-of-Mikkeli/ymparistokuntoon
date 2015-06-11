var imageDAO = require('../../DAO/imageDAO');


function findImage(images){ //TODO: wtf is this shit?!?
  if(images.constructor === Array){
    for(var i = images.length - 1; i >= 0;i--){
      if(typeof(images[i].buffer) !== 'undefined' && typeof(images[i].mimetype) !== 'undefined'){
        return images[i];
      }
    }
  }else{
    return images;
  }
}

exports.addImage = function(req, res){
  var img = findImage(req.files.image);
  var imgdata = img.buffer;
  var mimetype = img.mimetype;
  var current_id = req.body.current_id;
  if(typeof(current_id) === 'undefined' || current_id === ''){
    imageDAO.create(imgdata, mimetype, function(image){
      res.send({_id: image._id});
    }); 
  }else{
    imageDAO.update(current_id, imgdata, mimetype, function(image){
      res.send({_id: image._id});
    });
  }
};

exports.getImage = function(req, res){
  var id = req.param('id');
  imageDAO.findById(id, function(image){
    res.contentType(image.img.contentType);
    res.send(image.img.data);
  });
};

exports.getThumbnail = function(req, res){
  var id = req.param('id');
  imageDAO.findById(id, function(image){
    res.contentType(image.thumbnail.contentType);
    res.send(image.thumbnail.data);
  });
};