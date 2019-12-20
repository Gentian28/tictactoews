const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

//Port from environment variable or default - 4001
const port = process.env.PORT || 4001;

//Setting up express and adding socketIo middleware
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const connections = [];

app.get('/', (req, res, next) => {
    res.send('Tic-Tac-Toe Webservice');
})

io.sockets.on('connection', (socket) => {
    connections.push(socket);
    console.log(' %s sockets is connected', connections.length);

    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log(' %s sockets is connected', connections.length);
    });

    socket.on('sending message', (message) => {
        console.log('Message is received :', message);

        io.sockets.emit('new message', { message: message });
    });

    socket.on('move', (index) => {
        console.log('index is received :', index);

        io.sockets.emit('move made', { index: index });
    });

    socket.on('reset', () => {
        console.log('game reseted');

        io.sockets.emit('reset');
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));