/*
 * Database configuration
 */

var HOST = 'localhost';
var DB = 'ymparisto';

exports.getConnectionUrl = function(){
	return 'mongodb://'+HOST+'/'+DB;
};