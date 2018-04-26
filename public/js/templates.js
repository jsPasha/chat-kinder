function generateTempMessage(timestamp) {
	var template = $('#message_temp_template').html();
	var html = Mustache.render(template, {
		timestamp: timestamp,
		loader: '/img/Pacman.svg',
		type: function () {
			return function (content, render) {
				switch (data.type) {
					case 'image':
						return '<div class="image_message_body">' + render(content) + '</div>';
						break;
					case 'video':
						return '<div class="video_message_body">' + render(content) + '</div>';
						break;
					default:
						break;
				}
			}
		},
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
			return function (text, render) {
				switch (data.type) {
					case 'text':
						return render(text);
						break;
					case 'image':
						return '<div class="image_message_body"><img src="' + render(text) + '" /></div>';
						break;
					case 'video':
						return '<div class="video_message_body"><video controls><source src="' + render(text) + '" type="video/mp4"></video></div>';
						break;
					default:
						break;
				}
			}
		},
		text: data.text,
		sender: data.username || userName,
		time: moment(data.created_at).format('h:mm a'),
		position: data.id_sender === userId ? 'right my_message' : 'left'
	});	
}