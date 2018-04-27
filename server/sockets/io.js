const { saveMessage } = require('./../utils/message')
const { publicPath } = require('./../path');

var initSockets = (io, publicPath) => {
	io.on('connection', (socket) => {

		socket.emit();

		socket.on('createMessage', (message) => {

			saveMessage(message, (data, err) => {

				if (err) {
					return io.to(message.room).emit('messageError', err);
				}

				io.to(message.room).emit('newMessage', data);

			});

		});

		socket.on('joinRoom', (data) => {

			socket.join(data.room);

		});

	});
}

module.exports = { initSockets }