const uniqid = require('uniqid');
const moment = require('moment');
const { logEvent } = require('./logs');

var saveImage = (file, publicPath, uploadPath, room_id, id_sender, callback) => {

	var newFileName = uniqid() + file.name;
	var filePath = uploadPath + newFileName;

	file.mv(publicPath + filePath, function(err) {
		
		if (err) return callback(null,err);

		callback(filePath);

	});

};

module.exports = { saveImage };