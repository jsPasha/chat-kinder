const { pool } = require('../db/db');
const { logEvent } = require('./logs');

var getUserName = (id, callback) => {
	pool.getConnection(function (err, connection) {
		connection.query(`SELECT u.username	
			FROM user u	
			WHERE u.id = ${id}`, function (err, result, fields) {

				if (err) {
					logEvent(`QUERY ERROR: User with id ${id} is undefined`);
				}

				if (result.length) {
					return callback(result[0].username);
				}

				callback('undefined user');

				connection.release();
			});
	});
}
module.exports = { getUserName }