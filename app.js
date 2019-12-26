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
// const rooms = [];

app.get('/', (req, res, next) => {
    res.send('Tic-Tac-Toe Webservice');
})

io.sockets.on('connection', (socket) => {
    connections.push(socket);

    // send number of online players
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

    socket.on('generate room', (uuid) => {
        console.log(`Room generated by user: ${uuid}`);
        games.push({ socketId: socket.id, gameId: uuid, players: [] });
        // rooms.push({ gameId: uuid, players: [] });
        // console.log(rooms)
        io.sockets.emit('games', games);
    });


    socket.on('move', (data) => {
        console.log('index is received :', data.index);
        console.log('gameId :', data.gameId);

        io.sockets.emit('move made', data);
    });

    socket.on('reset', gameId => {
        console.log(`game with id ${gameId} was reseted`);

        io.sockets.emit('reset', gameId);
    });

    socket.on('join room', roomData => {
        const room = games.map(room => room.gameId).indexOf(roomData.gameId);
        if (games[room].players.length < 2) {
            games[room].players.push(roomData.playerId);
            io.sockets.emit('room joined', games[room]);
            // console.log(games);
        } else {
            console.log('error')
        }
        // console.log(room);
    })

    socket.on('exit room', data => {
        const room = games.map(room => room.gameId).indexOf(data.gameId);
        games[room].players.splice(games[room].players.indexOf(data.playerId), 1);
        io.sockets.emit('room exited', games[room])
    })
});

server.listen(port, () => console.log(`Listening on port ${port}`));