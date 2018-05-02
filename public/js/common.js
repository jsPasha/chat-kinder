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
		if (activeRoom) socket.emit('joinRoom', { room: activeRoom });
	});

	socket.on('newMessage', function (data) {
		var html = generateMessage(data);
		if (data.timestamp) {
			$('.temp-' + data.timestamp).remove()
		}
		$('#messages_body').append(html);
		scrollToBottom();
	});

	$('body').on('click', '.room_item', function () {

		$('.room_item').removeClass('active');
		$(this).addClass('active');

		$('#messages').css('visibility', 'visible');
		$('#messages_body').empty();

		var activeDay;
		var id = this.dataset.id;

		socket.emit('joinRoom', { room: id });

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


	// START FILE UPLOADING
	if (window.File && window.FileReader) { //These are the relevant HTML5 objects that we are going to use 
		$('#loadImageInput, #fileDoc, #FileBox').change(FileChosen);
	}
	else {
		$('#loadImageInput, #fileDoc, #FileBox').change(FileChosen);
		$('#loadImageInput, #fileDoc').change(function (e) {
			var timestamp = new Date().getTime();
			sendFile(timestamp, this.dataset.loadType, this);
		});
		// document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
	}

	var SelectedFile = {};
	var Name = {};
	var FReader = {};

	function FileChosen(evnt) {

		var id = Math.round(evnt.timeStamp);
		SelectedFile[id] = evnt.target.files[0];

		Name[id] = SelectedFile[id].name;
		StartUpload(id, evnt.target);

	}

	function StartUpload(id, target) {

		var fileType = target.dataset.loadType;

		generateTempMessage(id, fileType);

		if (target.value != "") {

			FReader[id] = new FileReader();

			var fileSizeInMegabyte = Math.round(SelectedFile[id].size / 1048576);

			FReader[id].onload = function (evnt) {
				socket.emit('uploadFile', { uniqIdForOneLoading: id, 'Name': Name[id], Data: evnt.target.result, type: fileType });
			}

			socket.emit('startUploadFile', { uniqIdForOneLoading: id, 'Name': Name[id], 'Size': SelectedFile[id].size, type: fileType });

			target.value = '';

		}
		else {
			alert("Please Select A File");
		}
	}

	socket.on('MoreData', function (data) {

		var id = data.uniqIdForOneLoading;
		UpdateBar(data['Percent'], id);
		var Place = data['Place'] * 524288; //The Next Blocks Starting Position
		var NewFile; //The Variable that will hold the new Block of Data

		NewFile = SelectedFile[id].slice(Place, Place + Math.min(524288, (SelectedFile[id].size - Place)));
		FReader[id].readAsBinaryString(NewFile);
	});

	function UpdateBar(percent, id) {
		$('.progress-' + id).css('width', percent + '%');
		// $('#percent').html(Math.round(percent * 100) / 100 + '%');
		// var MBDone = Math.round(((percent / 100.0) * SelectedFile.size) / 1048576);
		// $('#MB').html(MBDone);
	}

	socket.on('doneUploadVideo', function (data) {
		console.log(data)
		var timestamp = data.uniqIdForOneLoading;
		delete SelectedFile[timestamp];
		socket.emit('createMessage', {
			text: data.video,
			room: activeRoom,
			id_sender: userId,
			timestamp: timestamp,
			type: data.type
		});
	});
	// END FILE UPLOADING


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
				$('.progress-' + timestamp).css('width', persent + '%');

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

	$('body').on('click', '.video_link', function (e) {
		e.preventDefault();
		var video = '<video controls autoplay><source src="' + $(this).attr('href') + '"></video>';
		if (!document.getElementById('video_popup')) {
			$('body').append('<div id="video_popup"><div class="v_bg"></div>' + video + '</div>');
		} else {
			$('#video_popup').find('video').replaceWith(video);
		}

		$('html, body').addClass('popup-on')
		$('#video_popup').addClass('fixed');

	});

	$('body').on('click', '.v_bg', function () {
		$('html, body').removeClass('popup-on');
		$('#video_popup').removeClass('fixed');
		$('#video_popup').find('video').get(0).pause()
	})

});