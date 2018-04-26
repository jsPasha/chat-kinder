const { saveMessage } = require('./../utils/message')
const { videoUploader } = require('./../utils/videoUploader');

var initSockets = (io, publicPath) => {
	io.on('connection', (socket) => {

		socket.emit();

		socket.on('createMessage', (message) => {

			saveMessage(message, (data) => {

				io.to(message.room).emit('newMessage', data);

			});

		});

		socket.on('joinRoom', (data) => {

			if (data.prevRoom) socket.leave(data.prevRoom);

			socket.join(data.room);

		});

		var uploaders = {};

		socket.on('startUploadVideo', function (data, uploadId) {

			var uniqIdForOneLoading = data.uniqIdForOneLoading;

			uploaders[uniqIdForOneLoading] = new videoUploader();

			uploaders[uniqIdForOneLoading].startVideo(data, publicPath, socket, io, uniqIdForOneLoading);

		});


		socket.on('uploadVideo', function (data) {

			var uniqIdForOneLoading = data.uniqIdForOneLoading;

			uploaders[uniqIdForOneLoading].uploadVideo(data, publicPath, socket, io, uniqIdForOneLoading);

		});

	});
}

module.exports = { initSockets }