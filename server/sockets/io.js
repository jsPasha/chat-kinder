const { saveMessage } = require('./../utils/message')
const { publicPath } = require('./../path');
const { socketUploader } = require('./../utils/socketUploader');

var initSockets = (io) => {
	io.on('connection', (socket) => {

		socket.emit();

		console.log('asdasdasdasd')

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

		var uploaders = {};

		socket.on('startUploadFile', function (data, uploadId) {

			var uniqIdForOneLoading = data.uniqIdForOneLoading;

			uploaders[uniqIdForOneLoading] = new socketUploader();

			uploaders[uniqIdForOneLoading].startUpload(data, publicPath, socket, io, uniqIdForOneLoading);

		});

		socket.on('uploadFile', function (data) {

			var uniqIdForOneLoading = data.uniqIdForOneLoading;

			uploaders[uniqIdForOneLoading].uploading(data, publicPath, socket, io, uniqIdForOneLoading);

		});

	});
}

module.exports = { initSockets }