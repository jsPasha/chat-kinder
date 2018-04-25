const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const { pool } = require('./db/db');
const { logEvent } = require('./utils/logs');
const { saveFile } = require('./utils/files');
const { getUserName } = require('./utils/user');

const path = require('path');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process
	.env.PORT || 3000;

const { saveMessage } = require('./utils/message')

var app = express();

var server = http.createServer(app);

var io = socketIO(server);

app.use(express.static(publicPath));

app.use(bodyParser.json());

app.use(fileUpload());

app.post('/upload', function (req, res) {

	if (!req.files) return res.status(400).send('No files were uploaded.');

	let image = req.files.image;

	saveFile(image, publicPath, '/img/uploads/', req.body.room_id, req.body.id_sender, (filePath, err) => {

		if (err) return res.status(500).send(err);

		res.send(filePath);

	});

});

app.get('/rooms', (req, res) => {

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
					res.status(200).send({username, result});
				});

				connection.release();

			});
	});

});

app.get('/messages', (req, res) => {

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

});

io.on('connection', (socket) => {

	console.log('Socket IO: Connected');

	socket.emit()

	socket.on('createMessage', (message) => {
		saveMessage(message, (data) => {
			io.to(message.room).emit('newMessage', message);
		});
	});

	socket.on('joinRoom', (data) => {
		if (data.prevRoom) {
			socket.join(data.prevRoom);
		}
		socket.join(data.room);
	});

});



server.listen(port, () => {
	console.log(`Started on port ${port}`)
});