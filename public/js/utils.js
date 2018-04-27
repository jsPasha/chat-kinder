var userId = prompt('Enter id: \n Pavlo: 1 \n Igor: 2 \n Jenya: 3') || 0;

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