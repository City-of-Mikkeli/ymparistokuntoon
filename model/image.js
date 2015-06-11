var mongoose = require('mongoose');

var imageSchema = mongoose.Schema({
	img: {
		data: Buffer,
		contentType: {type: String, default: 'image/png'}
	},
	thumbnail: {
		data: Buffer,
		contentType: {type: String, default: 'image/png'}
	}
});

module.exports = imageSchema;