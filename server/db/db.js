const mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 100,
	
	// host: '',
	// user: '',
	// password: '',
	// database: ''

	host: 'localhost',
	user: 'root',
	password: '',
	database: 'kinder'
	
});

module.exports = { pool };
