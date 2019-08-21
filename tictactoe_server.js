const express = require('express');
const socketio = require('socket.io');
const app = express();

const server = app.listen(3001);

const io = socketio(server);

let matches = [];

app.post('create_match', function(req, res) {
    matches[req.params.match_id] = {id: req.params.match_id, grid: [[0, 0, 0], [0, 0, 0], [0, 0, 0]]};
});

io.sockets.on('connection', function(socket) {
    console.log('Client connected ID: ' + socket.id);
    socket.broadcast.emit('player_connected', {id: socket.id});
    io.to(socket.id).emit('current_players', players);
    players[socket.id] = {id: socket.id, x: 10, y: 10, user_data: null}

    socket.on('grid_update', function(data) {
        matches[data.match_id].grid[x][y] = data.n;
        socket.broadcast.emit('grid_update', matches[data.match_id]);
    });

    socket.on('disconnect', function() {
        console.log('Client disconnected ID: ' + socket.id);
        socket.broadcast.emit('player_disconnected', {id: socket.id});
    });
});
