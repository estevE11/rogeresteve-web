const express = require('express');
const socketio = require('socket.io');
const app = express();

const server = app.listen(3000);

const io = socketio(server);

let players = [];

io.sockets.on('connection', function(socket) {
    console.log('Client connected ID: ' + socket.id);
    socket.broadcast.emit('player_connected', {id: socket.id});
    io.to(socket.id).emit('current_players', players);
    players[socket.id] = {id: socket.id, x: 10, y: 10, user_data: null}

    socket.on('player_update', function(data) {
        players[data.id] = data;
        socket.broadcast.emit('player_update', data);
    });
    
    socket.on('player_move', function(data) {
        socket.broadcast.emit('player_move', data);
        //console.log(data.user_data.username + ' --> (' + data.pos.x + ', ' + data.pos.y + ') ID: ' + data.id);
        players[socket.id] = {x: data.pos.x, y:data.pos.y}
    });

    socket.on('disconnect', function() {
        console.log('Client disconnected ID: ' + socket.id);
        socket.broadcast.emit('player_disconnected', {id: socket.id});
        delete players[socket.id];
    });
});

