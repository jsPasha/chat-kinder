const moment = require('moment');
const { pool } = require('../db/db');

var saveMessage = (message, callback) => {

	var text = message.text;
	var room_id = message.room;
	var id_sender = message.id_sender;
	var created_at = moment().valueOf();

	pool.getConnection(function (err, connection) {

		connection.query('INSERT INTO chat_messages SET ?', {
			room_id,
			id_sender,
			text,
			created_at
		}, function (err, result, fields) {
			if (err) throw err;
			connection.release();
			callback({
				id_sender,
				text,
				createdAt: moment().valueOf()
			});
		});

	});

};

module.exports = { saveMessage };