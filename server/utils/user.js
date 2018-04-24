const { pool } = require('../db/db');

var getUserName = (id, callback) => {
	pool.getConnection(function (err, connection) {
		connection.query(`SELECT u.username	
			FROM user u	
			WHERE u.id = ${id}`, function (err, result, fields) {
				if (err) throw err;
				callback(result[0].username);
				connection.release();
			});
	});
}
module.exports = { getUserName }