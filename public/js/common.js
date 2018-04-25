var userId = prompt('Enter id: \n Pavlo: 1 \n Igor: 2 \n Jenya: 3') || 0;
var userName;

axios.get('/rooms', {
	params: {
		user_id: userId
	}
}).then(function (response) {
	userName = response.data.username;
	response.data.result.forEach(function (el) {
		var template = $('#room_template').html();
		var html = Mustache.render(template, {
			name: el.name,
			id: el.id
		});
		$('#rooms').append(html);
	})
}).catch(function (error) {
	console.log(error);
});

var activeRoom = false;

$(function () {
	var socket = io();

	socket.on('newMessage', function (data) {
		var html = generateMessage(data);
		console.log(data)
		if (data.timestamp) $('.temp-'+data.timestamp).remove();
		$('#messages_body').append(html);
		scrollToBottom();
	});

	$('#loadImageInput').change(function () {
		var timestamp = new Date().getTime();
		generateTempMessage(timestamp);
		sendImage(timestamp);
	});

	$('body').on('click', '.room_item', function () {

		$('#messages').css('visibility', 'visible');
		$('#messages_body').empty();

		var activeDay;
		var id = this.dataset.id;

		socket.emit('joinRoom', {
			prevRoom: activeRoom,
			room: id
		});

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

	function generateTempMessage(timestamp) {
		var template = $('#message_temp_template').html();
		var html = Mustache.render(template, {
			timestamp: timestamp,
			loader: '/img/Pacman.svg',
			sender: userName,
			position: 'right my_message'
		});
		$('#messages_body').append(html);
		scrollToBottom();
	}

	function generateMessage(data) {
		var template = $('#message_template').html();
		return Mustache.render(template, {
			type: function () {
				return function(text, render) {
					if (data.type == 'text') {
						return render(text);
					} else if (data.type == 'image') {
						return '<div class="image_message_body"><img src="' + render(text) + '" /></div>';
					}
				}
			},
			text: data.text,
			sender: data.username || userName,
			time: moment(data.created_at).format('h:mm a'),
			position: data.id_sender === userId ? 'right my_message' : 'left'
		});
	}

	function scrollToBottom() {
		var messages = $('#messages_body');
		var newMessage = messages.children('li:last-child');
		var clientHeight = messages.prop('clientHeight');
		var scrollTop = messages.prop('scrollTop');
		var scrollHeight = messages.prop('scrollHeight');
		var newMessageHeight = newMessage.innerHeight();
		var lastMessageHeight = newMessage.prev().innerHeight();

		messages.scrollTop(scrollHeight);

		// if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
		// 	messages.scrollTop(scrollHeight);
		// }

	}

	function sendImage(timestamp) {
		var formData = new FormData();
		var imagefile = document.querySelector('[name=sampleFile]');

		formData.append('image', imagefile.files[0]);

		formData.append('room_id', activeRoom);
		formData.append('id_sender', userId);

		axios.post('/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		}).then(function (response) {
			socket.emit('createMessage', {
				text: response.data,
				room: activeRoom,
				id_sender: userId,
				type: 'image',
				timestamp: timestamp
			});
		}).catch(function (error) {
			console.log(error)
		});
	}

});