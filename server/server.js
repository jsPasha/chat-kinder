const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const { pool } = require('./db/db');
const fs = require('fs');

const path = require('path');
const http = require('http');

const publicPath = path.join(__dirname, '../public');
const port = process
	.env.PORT || 3000;

const { saveMessage } = require('./utils/message')
const { getUserName } = require('./utils/user.js')

var app = express();

var server = http.createServer(app);

var io = socketIO(server);

app.use(express.static(publicPath));

app.use(bodyParser.json());

app.get('/rooms', (req, res) => {

	pool.getConnection(function (err, connection) {

		connection.query(`SELECT cr.id, cr.name
		FROM chat_rooms cr
		LEFT JOIN chat_room_user cru
		ON cr.id = cru.id_room
		WHERE cru.id_user = ${req.query.user_id}`, function (err, result, fields) {
				if (err) {
					return console.log(err);
				}
				res.status(200).send(result);
				connection.release();
				
			});
	});

});

app.get('/messages', (req, res) => {

	pool.getConnection(function (err, connection) {

		connection.query(`SELECT cm.created_at, cm.text, cm.id_sender, u.username
		from chat_messages cm
		inner join user u
		on cm.id_sender = u.id
		where cm.room_id = ${req.query.room_id}
		ORDER BY cm.created_at DESC`, function (err, result, fields) {
				if (err) return console.log(err);
				res.status(200).send(result);
				connection.release();
			});
	});

});

io.on('connection', (socket) => {
	console.log('Socket IO: Connected');

	socket.emit()

	socket.on('createMessage', (message) => {
		var messageData;
		var username;

		saveMessage(message, (data) => {

			messageData = data;

			getUserName(message.id_sender, (name) => {

				messageData.username = name;

				io.to(message.room).emit('newMessage', messageData);

			});

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