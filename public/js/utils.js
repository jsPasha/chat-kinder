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

function scrollToBottom() {
	var messages = $('#messages_body');
	var newMessage = messages.children('li:last-child');
	var clientHeight = messages.prop('clientHeight');
	var scrollTop = messages.prop('scrollTop');
	var scrollHeight = messages.prop('scrollHeight');
	var newMessageHeight = newMessage.innerHeight();
	var lastMessageHeight = newMessage.prev().innerHeight();

	messages.scrollTop(scrollHeight);

}