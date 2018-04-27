const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

const { appRoutes } = require('./routes/routes');
const { initSockets } = require('./sockets/io')


const http = require('http');
const { publicPath } = require('./path');

const port = process
	.env.PORT || 3000;

var app = express();

var server = http.createServer(app);

var io = socketIO(server);

app.use(express.static(publicPath));

app.use(bodyParser.json());

app.use(fileUpload({
	limits: { fileSize: 200 * 1024 * 1024 },
	abortOnLimit: true
}));

var routes = new appRoutes();

app.post('/upload', function (req, res) {

	routes.postUpload(req, res);

});

app.get('/rooms', (req, res) => {

	routes.getRooms(req, res);

});

app.get('/messages', (req, res) => {

	routes.getMessages(req, res);

});

initSockets(io);

server.listen(port, () => {
	console.log(`Started on port ${port}`)
});