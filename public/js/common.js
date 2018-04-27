function getRooms() {
	$('#messages').css('visibility', 'hidden');
	$('#rooms').empty();
	axios.get('/rooms', {
		params: {
			user_id: userId
		}
	}).then(function (response) {
		userName = response.data.username;
		$('#user').text(userName)
		response.data.result.forEach(function (el) {
			var template = $('#room_template').html();
			var html = Mustache.render(template, {
				name: el.name,
				id: el.id
			});
			$('#rooms').append(html);
		})
	}).catch(function (error) {
		console.log(JSON.stringify(error, undefined, 2));
	});
}

getRooms();

var activeRoom = false;

$(function () {
	var socket = io();

	socket.on('connect', function () {
		if (activeRoom) socket.emit('joinRoom', {room: activeRoom});
	});

	socket.on('newMessage', function (data) {
		var html = generateMessage(data);
		if (data.timestamp) {
			$('.temp-' + data.timestamp).remove()
		}
		$('#messages_body').append(html);
		scrollToBottom();
	});

	$('#loadImageInput, #FileBox, #fileDoc').change(function (e) {
		var timestamp = new Date().getTime();		
		sendFile(timestamp, this.dataset.loadType, this);
	});

	$('body').on('click', '.room_item', function () {

		$('.room_item').removeClass('active');
		$(this).addClass('active');

		$('#messages').css('visibility', 'visible');
		$('#messages_body').empty();

		var activeDay;
		var id = this.dataset.id;

		socket.emit('joinRoom', {room: id});

		activeRoom = id;

		axios.get('/messages', {
			params: {
				room_id: id
			}
		}).then(function (response) {
			response.data.forEach(function (el) {
				var html = generateMessage(el);

				$('#messages_body').prepend(html);

				scrollToBottom();
			});
		}).catch(function (error) {
			console.log(error);
		});
	});

	$('#messages_form_self').submit(function (e) {
		e.preventDefault();
		socket.emit('createMessage', {
			text: $('#message').val(),
			room: activeRoom,
			id_sender: userId,
			type: 'text'
		});

		this.reset();

	});

	function sendFile(timestamp, type, input) {
		var formData = new FormData();

		if (input.files[0].size > 200 * 1024 * 1024) {
			input.value = '';
			return alert('Файл не должен превышать 200 мегабайт!');
		}

		generateTempMessage(timestamp, type);

		formData.append(type, input.files[0]);
		formData.append('room_id', activeRoom);
		formData.append('id_sender', userId);
		formData.append('type', type);

		axios.post('/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress: function (progressEvent) {
			
				var loaded = progressEvent.loaded;
				var total = progressEvent.total;
				var persent = Math.round(loaded / total) * 100;
				$('.progress-'+timestamp).css('width', persent + '%');

			},
		}).then(function (response) {
			input.value = '';
			console.log(response)
			socket.emit('createMessage', {
				text: response.data.filePath,
				room: activeRoom,
				id_sender: userId,
				type: response.data.type,
				timestamp: timestamp
			});
		}).catch(function (error) {
			console.log(error)
		});
	}
});