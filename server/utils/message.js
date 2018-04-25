const moment = require('moment');
const { pool } = require('../db/db');
const { logEvent } = require('./logs');

var saveMessage = (message, callback) => {

	console.log(message)

	var text = message.text;
	var room_id = message.room;
	var id_sender = message.id_sender;
	var created_at = moment().valueOf();
	var type = message.type;

	pool.getConnection(function (err, connection) {

		connection.query('INSERT INTO chat_messages SET ?', {
			room_id,
			id_sender,
			text,
			created_at,
			type
		}, function (err, result, fields) {
			if (err) {
				logEvent(`QUERY ERROR: Message form ${id_sender} was not saved!`);
				console.log(err);
			}
			connection.release();
			callback({
				id_sender,
				text,
				type,
				createdAt: moment().valueOf()
			});
		});

	});

};

module.exports = { saveMessage };