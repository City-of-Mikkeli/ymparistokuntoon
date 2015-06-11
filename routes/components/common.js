var feedbackDAO = require('../../DAO/feedbackDAO');

var SERVER_ROOT = '/ymparistokuntoon';

exports.index = function(req, res){
  res.render('index', {root : SERVER_ROOT});
};

exports.addFeedback = function(req, res){
  
  var coordinates = {
      lat : req.body.lat,
      lng : req.body.lng
  };
  
  var author = {
      name : req.body.name,
      email : typeof(req.body.email) !== 'undefined' ? req.body.email : '',
      phone : typeof(req.body.phone) !== 'undefined' ? req.body.phone : '',
  };
  
  feedbackDAO.create(req.body.text, req.body.image_id, author, coordinates, function(feedback){
    res.send(feedback);
  });
  
};

exports.getFeedback = function(req, res){
  /*Feedback.find(function(err, feedbacks){
    if(!err){
      res.send(feedbacks);
    }
  });*/
  res.send('sdaadsdsa');
};

exports.addReply = function(req, res){
  var id = req.body._id;
  feedbackDAO.reply(id, req.body.reply, function(feedback){
    res.send(feedback);
  });
};