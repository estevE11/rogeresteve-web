var canvas, ctx,
width = 500, height = 700,
board_width = 10, board_height = 20,

score = 0,
time = 0,

pieces = [
    [
        [0, 0, 1], // L
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [0, 1, 0, 0], // I
        [0, 1, 0, 0], 
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ],
    [
        [1, 1], // O
        [1, 1]
    ],
    [
        [0, 1, 1], // S
        [1, 1, 0],
        [0, 0, 0]
    ],
    [
        [0, 0, 0], // T
        [1, 1, 1],
        [0, 1, 0]
    ],
    [
        [1, 0, 0], // J
        [1, 1, 1],
        [0, 0, 0]
    ],
    [
        [1, 1, 0], // Z
        [0, 1, 1],
        [0, 0, 0]
    ],    
],

colors = [[255, 255, 255], [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 110, 0], [200, 0, 255], [0, 255, 255], [132, 132, 132]],

board = {
    x: 0,
    y: 0,

    grid: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],

    render: function() {
        let c;
        for (y = 0; y < board_height; y++) {
            for (x = 0; x < board_width; x++) {
                render_tile(this.x + x * piece.w, this.y + y * piece.h, this.grid[y][x]);
            }
        }
    },

    fill: function(mat,id, x, y) {
        for(xx = 0; xx < mat.length; xx++) {
            for(yy = 0; yy < mat.length; yy++) {
                if(mat[yy][xx] == 1)
                    board.grid[y+yy][x+xx] = id+1;
            }
        }
        this.check_rows();
    },

    check_rows: function() {
        let cleared = 0;
        for(y = 0; y < board_height; y++) {
            let sum = 0;
            for(x = 0; x < board_width; x++) {
                if(this.grid[y][x] > 0) sum++;
            }
            if(sum == board_width) {
                cleared++;
                let temp = [];
                for(yy = 0; yy < y; yy++) {
                    let temp_row = [];
                    for(xx = 0; xx < board_width; xx++) {
                        console.log('(' + xx + ', ' + yy + ")");
                        temp_row.push(board.grid[yy][xx]);
                    }
                    temp.push(temp_row);
                }
                for(yy = 0; yy < temp.length; yy++) {
                    console.log('Copiyng line: ' + yy + ' into line: ' + (yy+1));
                    for(xx = 0; xx < board_width; xx++) {
                        this.grid[yy+1][xx] = temp[yy][xx];
                    }
                }
            }
        }
        let scores = [0, 40, 100, 300, 1200];
        score += scores[cleared];
    }
},

piece = {
    id: 0,
    x: 0,
    y: 0,
    w: 30,
    h: 30,
    mat: null,
    pred_y: 0,

    on_create: function() {
        this.id = Math.floor(Math.random() * 7);;
        this.mat = JSON.parse(JSON.stringify(pieces[this.id]));
        this.y = 0;
        this.x = Math.floor(Math.random()*6);
        this.calculate_prediction();
    },

    update: function() {
        if(this.check_collision()) {
            board.fill(this.mat, this.id, this.x, this.y);
            this.on_create();
        }
        this.y++;
    },

    render: function() {
        let w = this.mat.length;
        for(y = 0; y < w; y++) {
            for(x = 0; x < w; x++) {
                if(this.mat[y][x] === 1) {
                    render_tile((this.x + x)*this.w, (this.y + y)*this.w, this.id+1);
                }
            }
        }

        this.render_prediction();
    },

    move: function(x) {
        if(x > 1) x = 1;
        else if(x < -1) x = -1;
        if(!this.check_side_collision(x)) {
            this.x += x;
            this.calculate_prediction();
        }
    },

    rotate: function() {
        let mat = JSON.parse(JSON.stringify(this.mat));
        let N = this.mat.length;

        for (i = 0; i < N / 2; i++) { 
            for (j = i; j < N - i - 1; j++) { 
                // Swap elements of each cycle 
                // in clockwise direction 
                let temp = mat[i][j];
                mat[i][j] = mat[N - 1 - j][i];
                mat[N - 1 - j][i] = mat[N - 1 - i][N - 1 - j];
                mat[N - 1 - i][N - 1 - j] = mat[j][N - 1 - i];
                mat[j][N - 1 - i] = temp;
            } 
        }
        if(!this.check_collision(mat) && !this.check_side_collision(-1, mat) && !this.check_side_collision(1)) {
            this.mat = mat;
            this.calculate_prediction();
        }
    },

    end_move: function() {
        while(!this.check_collision()) {
            this.y++;
            score++;
        }
        board.fill(this.mat, this.id, this.x, this.y);
        this.on_create();
    },

    check_collision: function(mat) {
        if(!mat) {
            mat = this.mat;
        }
        let w = mat.length;
        for(y = 0; y < w; y++) {
            for(x = 0; x < w; x++) {
                if(mat[y][x] === 1) {
                    let xx = this.x + x;
                    let yy = this.y+1 + y;
                    if(yy > 19) return true;
                    if(board.grid[yy][xx] !== 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    check_side_collision: function(_x, mat) {
        if(!mat) {
            mat = this.mat;
        }
        let w = mat.length;
        for(y = 0; y < w; y++) {
            for(x = 0; x < w; x++) {
                if(mat[y][x] == 1) {
                    let xx = this.x + x + _x;
                    let yy = this.y + y;
                    if(board.grid[yy][xx] != 0) {
                        return true;
                    }
                }
            }
        }
    },

    calculate_prediction: function() {
        let init_y = this.y;
        while(!this.check_collision()) {
            this.y++;
        }
        this.pred_y = this.y;
        this.y = init_y;
    },

    render_prediction: function () {
        let w = this.mat.length;
        let r_w = 27;
        for(y = 0; y < w; y++) {
            for(x = 0; x < w; x++) {
                if(this.mat[y][x] === 1) {
                    c = colors[this.id+1];
                    ctx.fillStyle = col(c[0], c[1], c[2], 0.5);
                    ctx.fillRect(100 + (this.x*this.w + x*this.w) + (this.w-r_w), 50 + (this.pred_y*this.w + y*this.w) + (this.w-r_w), this.w - (this.w-r_w)*2, this.h - (this.w-r_w)*2);
                }
            }
        }
    }
};

function init() {
    canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 700;
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    document.addEventListener('keydown', key_down);

    start();
}

function start() {
    piece.on_create();
    window.requestAnimationFrame(game_loop);
}

function game_loop() {
    update();
    render();
    time++;
    window.requestAnimationFrame(game_loop);
}

function update() {
    if(time > 20) {
        piece.update();
        time = 0;
    }
}

function render() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    board.render();

    //Render score
    ctx.font = 'normal 36px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 10, 37);

    piece.render();
}

function key_down(e) {
    console.log('keydown');
    if(e.keyCode === 37) piece.move(-1);
    if(e.keyCode === 39) piece.move(1);
    if(e.keyCode === 40) piece.end_move();
    if(e.keyCode === 38) piece.rotate();
}

function render_tile(x, y, id) {
    let w = piece.w;
    let in_rect = 29;

    c = colors[id];

    ctx.fillStyle = col(c[0]-50, c[1]-50, c[2]-50);
    ctx.fillRect(100 + x, 50 + y, w, w);

    ctx.fillStyle = col(c[0], c[1], c[2]);
    ctx.fillRect(100 + x + (w-in_rect), 50 + y + (w-in_rect), w - (w-in_rect)*2, w - (w-in_rect)*2);
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