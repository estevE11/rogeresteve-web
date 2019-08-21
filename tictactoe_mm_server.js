const request = require('request');
const express = require('express');
const socketio = require('socket.io');
const app = express();

const server = app.listen(3002);

const io = socketio(server);

let players = [];
let invites = [];

io.sockets.on('connection', function(socket) {
    console.log('Client connected ID: ' + socket.id);
    socket.broadcast.emit('player_connected', {id: socket.id});
    io.to(socket.id).emit('current_players', players);
    players[socket.id] = {id: socket.id, user_data: null};

    socket.on('player_update', function(data) {
        players[socket.id] = {id: socket.id, user_data: data.user_data};
    });

    socket.on('invite', function(data) {
        io.to(data.receiver_id).emit('invite', {sender_id: data.sender_id, username: data.username});
        const invite_id = data.sender_id + '//' + data.receiver_id;
        invites[invite_id] = {invite_id: invite_id, sender_id: data.sender_id, receiver_id: data.receiver_id};
    });

    socket.on('accept', function(data) {
        if(invites[data.invite_id]) {
            if(!players[data.sender_id]) {
                delete invites[invite_id];
                return;
            }
            let data = {
                match_id: data.invite_id;
            };
            let client_server_opt = {
                uri: 'localhost:3001/create_match',
                body: JSON.stringify(data),
                methon: 'POST',
                headers: {
                    'Content-Type': 'application-json'
                }
            }
            request(client_server_opt, function(err, res) {
                if(err) {
                    console.log(err);
                } else {
                    io.to(data.sender_id).emit('start_match', {match_id: data.invite_id});
                    io.to(data.receiver_id).emit('start_match', {match_id: data.invite_id});
                }
            });
        }
    });

    socket.on('disconnect', function() {
        console.log('Client disconnected ID: ' + socket.id);
        delete players[socket.id];
        socket.broadcast.emit('player_disconnected', {id: socket.id, players: players});
    });
});