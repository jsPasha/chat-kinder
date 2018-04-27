const moment = require('moment');
const { pool } = require('../db/db');
const { logEvent } = require('./logs');
const { getUserName } = require('./user');
var CryptoJS = require("crypto-js");


var saveMessage = (message, callback) => {

	var text = message.text;

	var ciphertext = CryptoJS.AES.encrypt(text, 'infinitywar').toString();
 
	var room_id = message.room;
	var id_sender = message.id_sender;
	var created_at = moment().valueOf();
	var type = message.type;
	var timestamp = message.timestamp

	if (!text) {
		return callback(undefined, 'Empty text value');
	}

	pool.getConnection(function (err, connection) {

		if (err) {
			return res.status(400).send(err)
		}

		connection.query('INSERT INTO chat_messages SET ?', {
			room_id,
			id_sender,
			text: ciphertext,
			created_at,
			type
		}, function (err, result, fields) {
			if (err) {
				logEvent(`QUERY ERROR: Message form ${id_sender} was not saved!`);
				console.log(err);
			}

			connection.query(`SELECT username FROM user u WHERE u.id = ${id_sender}`, function (error, datauser, fields) {
				if (error) {
					logEvent(`QUERY ERROR: USERNAME form ${id_sender} was not getted!`);
					console.log(error);
				}
				callback({
					id_sender,
					username: datauser[0].username,
					text,
					type,
					timestamp,
					createdAt: moment().valueOf()
				});
				connection.release();
			});
		});
	});
};

var generateHash = (text) => {
	return new Promise((resolve, reject) => {
		bcrypt.genSalt(8, (err, salt) => {
			if (err) {
				reject();
			} else {
				bcrypt.hash(text, salt, (err, hash) => {
					resolve(hash);
				});
			}
		});
	});
}

module.exports = { saveMessage };