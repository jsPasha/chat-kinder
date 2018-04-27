const ffmpeg = require('ffmpeg');
const { publicPath } = require('./../path');

class formatVideo {
	constructor(video) {
		this.video = video;
	}

	formatToMp4(callback) {
		try {
			var process = new ffmpeg(publicPath + this.video);
			process.then(function (video) {
				video.fnExtractFrameToJPG(publicPath + '/video/frames/', {
					frame_rate: 1,
					number: 5,
					file_name: 'asdasd'
				}, function (error, files) {
					if (!error)
						console.log('Frames: ' + files);
				});
			}, function (err) {
				console.log('Error: ' + err);
			});

		} catch (error) {
			console.log(`ERROR: ${error.code}`);
			console.log(`ERROR: ${error.msg}`);
		}
	}
}

module.exports = { formatVideo };