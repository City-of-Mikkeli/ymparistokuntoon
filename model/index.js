var mongoose = require('mongoose');
var feedbackSchema = require('./feedback.js');
var imageSchema = require('./image.js');

exports.Feedback = mongoose.model('Feedback', feedbackSchema);
exports.Image = mongoose.model('Image', imageSchema);