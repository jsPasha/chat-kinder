const fs = require('fs');
const exec = require('child_process').exec;
const util = require('util');
const uniqid = require('uniqid');

const tempPath = '/video/temp/';
const videoPath = '/video/uploads/'

class videoUploader {

	constructor() {
		this.Files = {};
		this.videoName = undefined;
	}

	startVideo (data, publicPath, socket, io, uniqIdForOneLoading) {

		let Name = uniqid() + data['Name'];
		let Files = this.Files;

		this.videoName = Name;

		console.log('Started video!')

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
		catch (er) {
		} //It's a New File

		fs.open(publicPath + tempPath + Name, "a", '0755', function(err, fd) {
			if (err) {
				console.log(err);
			}
			else {
				Files[Name]['Handler'] = fd; //We store the file handler so we can write to it later
				io.to(socket.id).emit('MoreData', { 'Place': Place, Percent: 0, uniqIdForOneLoading });
			}
		});
	}

	uploadVideo (data, publicPath, socket, io, uniqIdForOneLoading) {
		
		let Name = this.videoName;
		let Files = this.Files;

		Files[Name]['Downloaded'] += data['Data'].length;
		Files[Name]['Data'] += data['Data'];

		//If File is Fully Uploaded
		if (Files[Name]['Downloaded'] == Files[Name]['FileSize']) {
			fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', (err, Writen) => {
				var input = fs.createReadStream(publicPath + tempPath + Name);
				var output = fs.createWriteStream(publicPath + videoPath + Name);

				input.pipe(output);

				input.on("end", () => {
					fs.unlink(publicPath + tempPath + Name, () => { //This Deletes The Temporary File
						io.to(socket.id).emit('doneUploadVideo', { video: videoPath + Name, uniqIdForOneLoading });
						Files = {};
					});
				});
			});
		} else if (Files[Name]['Data'].length > 10485760) { //If the Data Buffer reaches 10MB
			fs.write(Files[Name]['Handler'], Files[Name]['Data'], null, 'Binary', (err, Writen) => {
				Files[Name]['Data'] = ""; //Reset The Buffer
				var Place = Files[Name]['Downloaded'] / 524288;
				var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
				io.to(socket.id).emit('MoreData', { Place, Percent, uniqIdForOneLoading });
			});
		} else {
			var Place = Files[Name]['Downloaded'] / 524288;
			var Percent = (Files[Name]['Downloaded'] / Files[Name]['FileSize']) * 100;
			io.to(socket.id).emit('MoreData', { Place, Percent, uniqIdForOneLoading });
		}
	}

}

module.exports = { videoUploader };