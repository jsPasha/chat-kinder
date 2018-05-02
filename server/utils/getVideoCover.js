const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

var getVideoCover = function (options, callback) {
	var proc = new ffmpeg(options.path + options.name).takeScreenshots({
		count: 1,
		filename: options.name + '.png',
		timemarks: ['10'], // number of seconds
		size: '400x230'
	}, options.path).on('end', function () {
		callback();
	});
};

module.exports = { getVideoCover };