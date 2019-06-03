var canvas, ctx,
width = 500, height = 700,
board_width = 10, board_height = 20,

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

colors = ['', 'red', 'green', 'blue', 'orange', 'purple', 'cyan', 'gray'],

board = {
    x: width/2 - 30*10/2,
    y: height/2 - 30*20/2,

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
        for(y = 0; y < board_height; y++) {
            for(x = 0; x < board_width; x++) {
                if(this.grid[y][x] == 0)
                    ctx.fillStyle = 'white';
                else
                    ctx.fillStyle = colors[this.grid[y][x]];
                ctx.fillRect(this.x + x*piece.w, this.y + y*piece.h, piece.w, piece.h);
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
        for(y = 0; y < board_height; y++) {
            let sum = 0;
            for(x = 0; x < board_width; x++) {
                if(this.grid[y][x] > 0) sum++;
            }
            if(sum == board_width) {               
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
    }
},

piece = {
    id: 0,
    x: 0,
    y: 0,
    w: 30,
    h: 30,
    mat: null,

    on_create: function() {
        this.id = Math.floor(Math.random() * 7);;
        this.mat = JSON.parse(JSON.stringify(pieces[this.id]));
        this.y = 0;
        this.x = Math.floor(Math.random()*6);
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
                if(this.mat[y][x] == 1) {
                    ctx.fillStyle = colors[this.id+1];
                    ctx.fillRect(100 + (this.x*this.w + x*this.w), 50 + (this.y*this.w + y*this.w), this.w, this.h);
                }
            }            
        }
    },

    move: function(x) {
        if(x > 1) x = 1;
        else if(x < -1) x = -1;
        if(!this.check_side_collision(x)) {
            this.x += x;
        }
    },

    rotate: function() {
        let N = this.mat.length;

        for (i = 0; i < N / 2; i++) { 
            for (j = i; j < N - i - 1; j++) { 
                // Swap elements of each cycle 
                // in clockwise direction 
                let temp = this.mat[i][j]; 
                this.mat[i][j] = this.mat[N - 1 - j][i]; 
                this.mat[N - 1 - j][i] = this.mat[N - 1 - i][N - 1 - j]; 
                this.mat[N - 1 - i][N - 1 - j] = this.mat[j][N - 1 - i]; 
                this.mat[j][N - 1 - i] = temp; 
            } 
        }  
    },

    end_move: function() {
        while(!this.check_collision()) {
            this.y++;
        }
        board.fill(this.mat, this.id, this.x, this.y);
        this.on_create();
    },

    check_collision: function() {
        let w = this.mat.length;
        for(y = 0; y < w; y++) {
            for(x = 0; x < w; x++) {
                if(this.mat[y][x] == 1) {
                    let xx = this.x + x;
                    let yy = this.y+1 + y;
                    if(yy > 19) return true;
                    if(board.grid[yy][xx] != 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    check_side_collision: function(_x) {
        let w = this.mat.length;
        for(y = 0; y < w; y++) {
            for(x = 0; x < w; x++) {
                if(this.mat[y][x] == 1) {
                    let xx = this.x + x + _x;
                    let yy = this.y + y;
                    if(board.grid[yy][xx] != 0) {
                        return true;
                    }
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

    piece.render();
}

function key_down(e) {
    console.log('keydown');
    if(e.keyCode == 37) piece.move(-1);
    if(e.keyCode == 39) piece.move(1);
    if(e.keyCode == 40) piece.end_move();
    if(e.keyCode == 38) piece.rotate();
}

window.onload = function() {
    init();
};