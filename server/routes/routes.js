const { pool } = require('./../db/db');
const { getUserName } = require('./../utils/user');
const { saveFile } = require('./../utils/saveFile');
const { publicPath } = require('./../path');
var CryptoJS = require("crypto-js");

class appRoutes {
	getMessages(req, res) {
		pool.getConnection(function (err, connection) {
			if (err) {
				return res.status(400).send(err)
			}
			connection.query(`SELECT cm.created_at, cm.text, cm.id_sender, cm.type, u.username
			from chat_messages cm
			inner join user u
			on cm.id_sender = u.id
			where cm.room_id = ${req.query.room_id}
			ORDER BY cm.created_at DESC`, function (err, result, fields) {
					if (err) {
						logEvent(`QUERY ERROR: Messages from room "${req.query.room_id}" was not selected`);

						connection.release();
						return console.log(err);
					}

					result = result.map((el) => {
						var bytes = CryptoJS.AES.decrypt(el.text, 'infinitywar');
						el.text = bytes.toString(CryptoJS.enc.Utf8);
						return el;
					});
					
					res.status(200).send(result);
					connection.release();
				});
		});
	}

	getRooms(req, res) {
		pool.getConnection(function (err, connection) {

			if (err) {
				return res.status(400).send(err)
			}

			var userId = req.query.user_id || 0;

			connection.query(`SELECT cr.id, cr.name
		FROM chat_rooms cr
		LEFT JOIN chat_room_user cru
		ON cr.id = cru.id_room
		WHERE cru.id_user = ${userId}`, function (err, result, fields) {

					if (err) {
						logEvent(`QUERY ERROR: Rooms for user "${userId}" was not selected`);
						connection.release();
						return console.log(err);
					}

					getUserName(userId, (username) => {
						res.status(200).send({ username, result });
					});

					connection.release();

				});
		});
	}

	postUpload(req, res, error) {

		if (error) {
			return res.status(400).send(error);
		}

		if (!req.files) return res.status(400).send('No files were uploaded.');

		let type = req.body.type;
		let file = req.files[type];

		console.log(type)

		saveFile(file, publicPath, `/${type}/uploads/`, req.body.room_id, req.body.id_sender, type, (fileInfo, err) => {

			if (err) return res.status(500).send(err);

			res.send(fileInfo);

		});

	}

}

module.exports = { appRoutes }