var Feedback = require('../model').Feedback;

exports.create = function(text, image_id, author, coords, callback){
  var feedback = new Feedback();
  feedback.text = text;
  feedback.image_id = image_id;
  feedback.created = new Date();
  feedback.author = author;
  feedback.coordinates = coords;
  
  feedback.save(function(err, feedback){
    if(err) throw err;
    callback(feedback);
  });
};

exports.list = function(callback){
  Feedback.find(function(err, feedbacks){
    callback(feedbacks);
  });
};

exports.reply = function(feedback_id, reply, callback){
  Feedback.findById(feedback_id, function(err, feedback){
    if(err) throw err;
    feedback.reply.text = reply;
    feedback.reply.replied = new Date();
    feedback.save(function(err, feedback){
      if(err) throw err;
      callback(feedback);
    });
  });
};