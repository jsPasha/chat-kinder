const fs = require('fs');

var logEvent = (name) => {
	fs.appendFile('server.log', name + '\n', (err) => {
		if (err) {
			console.log('unnable to append to server');
		}
	});
};

module.exports = { logEvent };
