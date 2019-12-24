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
const games = [];

app.get('/', (req, res, next) => {
    res.send('Tic-Tac-Toe Webservice');
})

io.sockets.on('connection', (socket) => {
    connections.push(socket);

    io.sockets.emit('connected players', connections.length);
    io.sockets.emit('games', games);

    console.log(' %s sockets is connected', connections.length);

    socket.on('disconnect', () => {
        console.log(socket.id)
        const index = games.map(e => e.socketId).indexOf(socket.id);
        if (index > -1) {
            games.splice(games.indexOf(index), 1);
        }
        connections.splice(connections.indexOf(socket), 1);
        io.sockets.emit('player disconnected', connections.length);
        io.sockets.emit('games', games);
        console.log(' %s sockets is connected', connections.length);
    });

    socket.on('generate game', (uuid) => {
        console.log('generate game', { user: uuid });
        games.push({ socketId: socket.id, userId: uuid });
        io.sockets.emit('games', games);
    });

    // socket.on('sending message', (message) => {
    //     console.log('Message is received :', message);

    //     io.sockets.emit('new message', { message: message });
    // });

    socket.on('move', (data) => {
        console.log('index is received :', data.index);
        console.log('gameId :', data.gameId);

        io.sockets.emit('move made', data);
    });

    socket.on('reset', () => {
        console.log('game reseted');

        io.sockets.emit('reset');
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));