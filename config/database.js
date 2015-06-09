/*
 * Database configuration
 */

var HOST = 'localhost';
var DB = 'city2020';

exports.getConnectionUrl = function(){
	return 'mongodb://'+HOST+'/'+DB;
};