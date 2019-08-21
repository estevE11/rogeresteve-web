var
canvas, ctx,
width = 640, height = 480,
socket, con_id,

players = [],
keypressed = [],

player = {
    x: 10,
    y: 10,
    w: 20,
    h: 20,
    col: col(255, 255, 255),

    update: function() {
        if(keypressed[37]) player.move(-1, 0);
        if(keypressed[39]) player.move(1, 0);
        if(keypressed[40]) player.move(0, 1);
        if(keypressed[38]) player.move(0, -1);
    },

    render: function() {
        ctx.fillStyle = this.col;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        if(user_data) render_text('You', this.x, this.y, 20, 'white');
    },

    move: function(vx, vy) {
        this.x += vx;
        this.y += vy;
        const data = {
            id: con_id,
            user_data: user_data,
            pos: {
                x: this.x,
                y: this.y
            }
        }

        socket.emit('player_move', data);
    }
};

function init() {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    socket = io.connect('localhost:3000');
    socket.on('connect', function() {
        console.log('connected');
        con_id = socket.id;
        socket.emit('player_update', {id: con_id, x: 10, y: 10, user_data: user_data});
        console.log('');
    });

    socket.on('current_players', function(data) {
        players = data;
        console.log(data.length + ' players already connected!');
    });

    socket.on('player_update', function(data) {
        players[data.id] = data;
        console.log('player updated');
    });

    socket.on('player_connected', function(data) {
        players[data.id] = {id: data.id, x: 10, y: 10};
        console.log('player connected');
    });

    socket.on('player_disconnected', function(data) {
        delete players[data.id];
        console.log('player disconnected');
    });

    socket.on('player_move', function(data) {
        if(!players[data.id]) {
            players[data.id] = {id: data.id, x: data.x, y: data.y, user_data: data.user_data};
            return;
        }

        players[data.id].x = data.pos.x;
        players[data.id].y = data.pos.y;
    });

    start();
}

function start() {
    window.requestAnimationFrame(game_loop);
}

function game_loop() {
    update();
    render();
    window.requestAnimationFrame(game_loop);
}

function update() {
    player.update();
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    player.render();

    for(let key in players) {
        let p = players[key];
        ctx.fillStyle = col(255, 255, 255);
        ctx.fillRect(p.x, p.y, 20, 20);
        if(p.user_data) render_text(p.user_data.username, p.x, p.y, 20, 'white');
    }
}

function keyDown(e) {
    keypressed[e.keyCode] = true;
}

function keyUp(e) {
    delete keypressed[e.keyCode];
}

function render_text(text, x, y, s, c) {
    if(!c) {
        c = 'black';
    }
    ctx.font = 'normal ' + s + 'px Arial';
    ctx.fillStyle = c;
    ctx.fillText(text, x, y);
}

function col(r, g, b, a) {
    if(!a) {
        a = 1.0;
    }
    return 'rgb(' + r + ',' + g + ',' + b + ',' + a + ')';
}

window.onload = function() {
    init();
};