const fs = require('fs');
const exec = require('child_process').exec;
const util = require('util');
const uniqid = require('uniqid');

var Files = {};

var tempPath = '/video/temp/';
var videoPath = '/video/uploads/'

var videoName;

var startVideo = (data, publicPath, socket) => {

	var Name = uniqid() + data['Name'];
	videoName = Name;

	console.log('Started videro!')

	Files[Name] = {  //Create a new Entry in The Files Variable
		FileSize: data['Size'],
		Data: "",
		Downloaded: 0
	}
	var Place = 0;
	try {
		var Stat = fs.statSync(publicPath + tempPath + Name);
		if (Stat.isFile()) {
			Files[Name]['Downloaded'] = Stat.size;
			Place = Stat.size / 524288;
		}
	}
	catch (er) { } //It's a New File
	fs.open(publicPath + tempPath + Name, "a", 0755, function (err, fd) {
		if (err) {
			console.log(err);
		}
		else {
			Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
			socket.emit('MoreData', { 'Place': Place, Percent: 0 });
		}
	});
}

var uploadVideo = (data, publicPath, socket) => {

	var Name = videoName;

	Files[Name]['Downloaded'] += data['Data'].length;
	Files[Name]['Data'] += data['Data'];


	//If File is Fully Uploaded
	if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) {
		fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
			var input = fs.createReadStream(publicPath + tempPath + Name);
			var output = fs.createWriteStream(publicPath + videoPath + Name);

			input.pipe(output);
			input.on("end", function () {
				console.log("end");
				fs.unlink(publicPath + tempPath + Name, function () { //This Deletes The Temporary File
					socket.emit('doneUploadVideo', { video: videoPath + Name });
				});
			});
		});
	} else if (Files[Name]['Data'].length > 10485760) { //If the Data Buffer reaches 10MB
		fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', function (err, Writen) {
			Files[Name]['Data'] = ""; //Reset The Buffer
			var Place = Files[Name]['Downloaded'] / 524288;
			var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
			socket.emit('MoreData', { 'Place': Place, 'Percent': Percent });
		});
	} else {
		var Place = Files[Name]['Downloaded'] / 524288;
		var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
		socket.emit('MoreData', { 'Place': Place, 'Percent': Percent });
	}
}

module.exports = { startVideo, uploadVideo };