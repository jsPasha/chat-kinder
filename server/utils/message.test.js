var expect = require('expect');

var { saveMessage } = require('./message');

describe('#saveMessage', () => {

	var text = 'Test Message';
	var room_id = '10';
	var id_sender = '1';
	var type = 'text';
	var timestamp = 123;

	var message = { text, room_id, id_sender, type, timestamp }

	var callbackResult;

	before(function (done) {
		saveMessage(message, (result, err) => {
			callbackResult = result;
			done();
		});
	});

	describe('#text message', () => {
		it('should return valid message with username value', function () {
			var username = 'Pavlo';
			var text = 'Test Message';
			var room_id = '10';
			var id_sender = '1';
			var type = 'text';
			var timestamp = 123;

			expect(callbackResult).toBeA("object");
			expect(callbackResult.username).toBe("Pavlo");
		});
	});

});

describe('#notSaveMessage', () => {

	var text = '';
	var room_id = '10';
	var id_sender = '1';
	var type = 'text';
	var timestamp = 123;

	var message = { text, room_id, id_sender, type, timestamp }

	var callbackResult;

	before(function (done) {
		saveMessage(message, (result, err) => {
			callbackResult = result;
			done();
		});
	});


	it('should not create message with empty text', function () {

		var username = 'Pavlo';
		var text = '';
		var room_id = '10';
		var id_sender = '1';
		var type = 'text';
		var timestamp = 123;

		expect(callbackResult).toBeA('string');
		expect(callbackResult).toBe("Empty text value");

	});


});