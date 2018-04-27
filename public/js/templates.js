function generateTempMessage(timestamp, type) {
	var template = $('#message_temp_template').html();
	var html = Mustache.render(template, {
		timestamp: timestamp,
		loader: '/img/Pacman.svg',
		messageType: type
	});
	$('.temp_messages').append(html);
}

function generateMessage(data) {
	var template = $('#message_template').html();
	var fileName = data.text.split('_kindrklink_')[1];
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
					case 'document':
						console.log(text)
						return '<div class="document_message_body"><a target="_blank" href="' + render(text) + '"><img src="img/download.svg"/>' + render("{{fileName}}") + '</a></div>';
						break;
					default:
						break;
				}
			}
		},
		text: data.text,
		fileName: fileName,
		sender: data.username || userName,
		time: moment(data.created_at).format('h:mm a'),
		position: data.id_sender === userId ? 'right my_message' : 'left'
	});
}