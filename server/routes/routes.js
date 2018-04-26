const { pool } = require('./../db/db');
const { getUserName } = require('./../utils/user');
const { saveImage } = require('./../utils/saveImage');
const { publicPath } = require('./../path');

class appRoutes {
	getMessages(req, res) {
		pool.getConnection(function (err, connection) {

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
					res.status(200).send(result);
					connection.release();
				});
		});
	}

	getRooms(req, res) {
		pool.getConnection(function (err, connection) {

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

	postUpload(req, res) {

		if (!req.files) return res.status(400).send('No files were uploaded.');

		let image = req.files.image;

		saveImage(image, publicPath, '/img/uploads/', req.body.room_id, req.body.id_sender, (filePath, err) => {

			if (err) return res.status(500).send(err);

			res.send(filePath);

		});

	}

}

module.exports = { appRoutes }