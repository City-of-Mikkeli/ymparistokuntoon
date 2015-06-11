var mongoose = require('mongoose');

var feedbackSchema = mongoose.Schema({
		text : String,
		created : Date,
		image_id : String,
		author : {
		  name : String,
		  email : String,
		  phone : String
		},
		coordinates : {
			lat : Number,
			lng : Number
		},
		reply : {
		  text : String,
		  replied : Date
		}
});

module.exports = feedbackSchema;