const uniqid = require('uniqid');
const moment = require('moment');

var saveFile = (file, publicPath, uploadPath, room_id, id_sender, type, callback) => {

	var newFileName = uniqid() + '_kindrklink_' + file.name;
	var filePath = uploadPath + newFileName;

	file.mv(publicPath + filePath, function(err) {
		
		if (err) return callback(null,err);

		callback({filePath, type});

	});

};

module.exports = { saveFile };