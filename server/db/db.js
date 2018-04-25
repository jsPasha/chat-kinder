const mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'by.ua',
	user: 'u_kinderklH',
	password: 'yRZYREa9TbwG',
	database: 'kinderklinik_chat'

	// host: 'localhost',
	// user: 'root',
	// password: '',
	// database: 'kinder'
});

module.exports = { pool };