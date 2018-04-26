var userId = undefined;

function getUserNameFromCookie() {
	var cookies = document.cookie.split(",");
	var cookieObj = {};
	cookies.forEach(function (e) {
		var cookieName = e.split('=')[0];
		var cookieVal = e.split('=')[1];
		if (cookieName == 'userId') {
			userId = cookieVal;
			return;
		}
	});
}

function setUserNameToCookie(name) {
	document.cookie = document.cookie + ",userId=" + name;
	var cookies = document.cookie.split(",");
	var newcookie = []
	cookies.forEach(function (e) {
		var cookieName = e.split('=')[0];
		var cookieVal = e.split('=')[1];
		if (cookieName == 'userId') {
			cookieVal = name;
			newcookie.push(cookieName + '=' + cookieVal)
		} else {
			newcookie.push(cookieName + '=' + cookieVal)
		}

	});
	document.cookie = newcookie.join(',');
}

getUserNameFromCookie();

if (!userId) {
	userId = prompt('Enter id: \n Pavlo: 1 \n Igor: 2 \n Jenya: 3') || 0;
	setUserNameToCookie(userId);
}

function changeUser() {
	userId = prompt('Enter id: \n Pavlo: 1 \n Igor: 2 \n Jenya: 3') || 0;
	setUserNameToCookie(userId);
	getRooms()
}

var userName;

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
		console.log(data)
		if (data.timestamp) $('.temp-' + data.timestamp).remove();
		$('#messages_body').append(html);
		scrollToBottom();
	});

	$('#loadImageInput').change(function (e) {
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
				return function (text, render) {
					switch (data.type) {
						case 'text':
							return render(text);
							break;
						case 'image':
							return '<div class="image_message_body"><img src="' + render(text) + '" /></div>';
							break;
						case 'video':
							return '<div class="video_message_body"><video controls><source src="' + render(text) + '#t=00:00:10" type="video/mp4"></video></div>';
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



	if (window.File && window.FileReader) { //These are the relevant HTML5 objects that we are going to use 
		$('#FileBox').change(FileChosen);
	}
	else {
		// document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
	}

	var SelectedFile;
	var Name;

	function FileChosen(evnt) {
		SelectedFile = evnt.target.files[0];
		Name = SelectedFile.name;
		StartUpload();
	}

	var FReader;

	function StartUpload() {
		if (document.getElementById('FileBox').value != "") {
			FReader = new FileReader();

			var fileSizeInMegabyte = Math.round(SelectedFile.size / 1048576);

			FReader.onload = function (evnt) {
				socket.emit('uploadVideo', { 'Name': Name, Data: evnt.target.result });
			}

			socket.emit('startUploadVideo', { 'Name': Name, 'Size': SelectedFile.size });
		}
		else {
			alert("Please Select A File");
		}
	}


	socket.on('MoreData', function (data) {
		UpdateBar(data['Percent']);
		var Place = data['Place'] * 524288; //The Next Blocks Starting Position
		var NewFile; //The Variable that will hold the new Block of Data
		if (SelectedFile.webkitSlice)
			NewFile = SelectedFile.webkitSlice(Place, Place + Math.min(524288, (SelectedFile.size - Place)));
		else
			NewFile = SelectedFile.slice(Place, Place + Math.min(524288, (SelectedFile.size - Place)));
		FReader.readAsBinaryString(NewFile);
	});

	function UpdateBar(percent) {
		$('#ProgressBar').show();
		$('#ProgressBar').css('width', percent + '%');
		// $('#percent').html(Math.round(percent * 100) / 100 + '%');
		// var MBDone = Math.round(((percent / 100.0) * SelectedFile.size) / 1048576);
		// $('#MB').html(MBDone);
	}

	socket.on('doneUploadVideo', function (data) {
		console.log(data)
		$('#ProgressBar').css('width', '100%');
		SelectedFile = null;
		$('#FileBox').val('');
		$('#ProgressBar').hide();
		socket.emit('createMessage', {
			text: data.video,
			room: activeRoom,
			id_sender: userId,
			type: 'video'
		});
	});

	function Refresh() {
		location.reload(true);
	}

});