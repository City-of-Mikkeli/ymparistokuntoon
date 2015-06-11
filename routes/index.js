var common = require('./components/common');
var image = require('./components/image');

var SERVER_ROOT = '/ymparistokuntoon';

module.exports = function(app){
  
  app.get(SERVER_ROOT, common.index);
  app.get(SERVER_ROOT+'/feedback', common.getFeedback);
  
  app.post(SERVER_ROOT+'/feedback', common.addFeedback);
  app.post(SERVER_ROOT+'/reply', common.addReply);
  
  app.post(SERVER_ROOT+'/image', image.addImage);
  app.get(SERVER_ROOT+'/image/:id/full', image.getImage);
  app.get(SERVER_ROOT+'/image/:id/thumb', image.getThumbnail);
  
};