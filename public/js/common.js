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
		console.log(error);
	});
}

getRooms();

var activeRoom = false;

$(function () {
	var socket = io();

	socket.on('newMessage', function (data) {
		var html = generateMessage(data);
		if (data.timestamp) $('.temp-' + data.timestamp).remove();
		$('#messages_body').append(html);
		scrollToBottom();
	});

	$('#loadImageInput').change(function (e) {
		var timestamp = new Date().getTime();
		generateTempMessage(timestamp, 'image');
		sendImage(timestamp);
	});

	$('body').on('click', '.room_item', function () {

		$('.room_item').removeClass('active');
		$(this).addClass('active');

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


	// START VIDEO UPLOADING
	if (window.File && window.FileReader) { //These are the relevant HTML5 objects that we are going to use 
		$('#FileBox').change(FileChosen);
	}
	else {
		// document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
	}

	var SelectedFile = {};
	var Name = {};
	var FReader = {};

	function FileChosen(evnt) {
		var uniqIdForOneLoading = Math.round(evnt.timeStamp);
		SelectedFile[uniqIdForOneLoading] = evnt.target.files[0];
		Name[uniqIdForOneLoading] = SelectedFile[uniqIdForOneLoading].name;
		StartUpload(uniqIdForOneLoading);
	}	

	function StartUpload(uniqIdForOneLoading) {

		generateTempMessage(uniqIdForOneLoading, 'video');

		if (document.getElementById('FileBox').value != "") {

			FReader[uniqIdForOneLoading] = new FileReader();

			var fileSizeInMegabyte = Math.round(SelectedFile[uniqIdForOneLoading].size / 1048576);

			FReader[uniqIdForOneLoading].onload = function (evnt) {
				socket.emit('uploadVideo', { uniqIdForOneLoading: uniqIdForOneLoading, 'Name': Name[uniqIdForOneLoading], Data: evnt.target.result });
			}

			socket.emit('startUploadVideo', { uniqIdForOneLoading: uniqIdForOneLoading, 'Name': Name[uniqIdForOneLoading], 'Size': SelectedFile[uniqIdForOneLoading].size });

		}
		else {
			alert("Please Select A File");
		}
	}
	
	socket.on('MoreData', function (data) {
		UpdateBar(data['Percent']);
		var uniqIdForOneLoading = data.uniqIdForOneLoading;
		var Place = data['Place'] * 524288; //The Next Blocks Starting Position
		var NewFile; //The Variable that will hold the new Block of Data
		if (SelectedFile[uniqIdForOneLoading].webkitSlice)
			NewFile = SelectedFile[uniqIdForOneLoading].webkitSlice(Place, Place + Math.min(524288, (SelectedFile[uniqIdForOneLoading].size - Place)));
		else
			NewFile = SelectedFile[uniqIdForOneLoading].slice(Place, Place + Math.min(524288, (SelectedFile[uniqIdForOneLoading].size - Place)));
		FReader[uniqIdForOneLoading].readAsBinaryString(NewFile);
	});

	function UpdateBar(percent) {
		$('#ProgressBar').show();
		$('#ProgressBar').css('width', percent + '%');
		// $('#percent').html(Math.round(percent * 100) / 100 + '%');
		// var MBDone = Math.round(((percent / 100.0) * SelectedFile.size) / 1048576);
		// $('#MB').html(MBDone);
	}

	socket.on('doneUploadVideo', function (data) {
		var timestamp = data.uniqIdForOneLoading;
		$('#ProgressBar').css('width', '100%');
		delete SelectedFile[timestamp];
		$('#FileBox').val('');
		$('#ProgressBar').hide();
		socket.emit('createMessage', {
			text: data.video,
			room: activeRoom,
			id_sender: userId,
			timestamp: timestamp,
			type: 'video'
		});
	});
	// END VIDEO UPLOADING

});