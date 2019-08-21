let socket, con_id;

function init() {
    socket = io.connect('localhost:3001');
    socket.on('connect', function() {
        con_id = socket.id;
    });

    socket.on('player_connected', function(data) {

    });

    socket.on('current_players', function(data) {
        $('.players_online_list').remove();
        let list = $('<ul class="players_online_list"></ul>');
        for(let i = 0; i < data.players.length; i++) {
            if(data.players[i].socket_id != data.players[i].socket_id) {
                list.append('<li class="players_online_list_player">' + data.players.user_data.username + ' <button id="invite">Invite</button></li>');
            }
        }
    });

    socket.on('invite', function(data) {

    });

    socket.on('disconnect', function(data) {

    });
}

window.onload = function() {
    init();
};