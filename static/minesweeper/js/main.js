var canvas, ctx,
width = 900, height = 600,
cell_w = 35, board_w = 16, board_h = 16,
bombs = 40,

clicks = 0,

img_floor = new Image(),
img_cover = new Image(),
img_bomb = new Image(),
img_flag = new Image(),

board = {
    bombs: null,
    covers: null,
    neigbours: null,
    flags: null,

    render_bombs: false,

    init_board: function(w, h, n) {
        //Init covers array full of 0
        this.covers = new Array(w);
        for(i = 0; i < w; i++) {
            this.covers[i] = new Array(h).fill(0);
        }

        //Init neighbours array full of 0
        this.neigbours = new Array(w);
        for(i = 0; i < w; i++) {
            this.neigbours[i] = new Array(h).fill(0);
        }

        //Init bombs array and placing random bombs
        this.bombs = new Array(w);
        for(i = 0; i < w; i++) {
            this.bombs[i] = new Array(h).fill(0);
        }

        //Init flags array empty
        this.flags = new Array(w);
        for(i = 0; i < w; i++) {
            this.flags[i] = new Array(h).fill(0);
        }
    },

    place_bombs: function(n, cell_x, cell_y) {
        for(i = 0; i < n; i++) {
            let x = Math.floor(Math.random()*board_w);
            let y = Math.floor(Math.random()*board_h);
            let dist = Math.sqrt((cell_x - x)  *  (cell_x - x) + (cell_y - y)  *  (cell_y - y));
            while(this.bombs[x][y] == 1 || dist < 3) {
                x = Math.floor(Math.random()*board_w);
                y = Math.floor(Math.random()*board_h);
                dist = Math.sqrt((cell_x - x)  *  (cell_x - x) + (cell_y - y)  *  (cell_y - y));
            }
            this.bombs[x][y] = 1;
        }
    },

    calc_neighbours: function() {
        for(x = 0; x < board_w; x++) {
            for(y = 0; y < board_h; y++) {
                if(this.bombs[x][y] != 1) {
                    let n = 0;
                    for(b = y-1; b < y+2; b++) {
                        for(a = x-1; a < x+2; a++) {
                            if((a != x || b != y) && (a >= 0 && a < board_w && b >= 0 && b < board_h)) {
                                if(this.bombs[a][b] == 1) n++;
                            }
                        }
                    }
                    this.neigbours[x][y] = n;
                } else {
                    this.neigbours[x][y] = -1;
                }
            }
        }        
    },

    render: function() {
        for(x = 0; x < board_w; x++) {
            for(y = 0; y < board_h; y++) {
                if(this.covers[x][y] == 0) {
                    ctx.drawImage(img_cover, x*cell_w, y*cell_w, cell_w, cell_w);                    
                } else {
                    ctx.drawImage(img_floor, 0, this.neigbours[x][y]*16, 16, 16, x*cell_w, y*cell_w, cell_w, cell_w);
                }
                if(this.flags[x][y] == 1) ctx.drawImage(img_flag, x*cell_w, y*cell_w, cell_w, cell_w);                    
                if(this.render_bombs && this.bombs[x][y] == 1) ctx.drawImage(img_bomb, x*cell_w, y*cell_w, cell_w, cell_w);                    
            }
        }
    },

    cell_selected: function(x, y, btn) {
        if(this.covers[x][y] == 1) return;
        if(btn == 0 && clicks == 0 && this.flags[x][y] == 0) {
            this.place_bombs(bombs, x, y);
            this.calc_neighbours();
        }
        console.log(x);
        console.log(y);
        if(btn == 2) {
            this.flags[x][y] = this.flags[x][y] == 1 ? 0 : 1;
        } 
        if(this.bombs[x][y] == 1 && this.flags[x][y] == 0) {
            end_game();
            return;
        }
        if(btn == 0 && this.flags[x][y] == 0) {
            clicks++;    
            this.open_cell(x, y);
        }
        else if(btn == 1) {}

    },

    open_cell: function(x, y) {
        console.log('clearing (' +  x +  ', '  + y + ') n:' + this.neigbours[x][y]);
        this.covers[x][y] = 1;
        if(this.neigbours[x][y] > 0) {
            return;
        }

        let tiles_to_clear = new Array(0);
        tiles_to_clear = [[x,  y]];
        while(tiles_to_clear.length >=  1) {
            x = tiles_to_clear[0][0];
            y = tiles_to_clear[0][1];
            console.log(x);
            console.log(y);
            if(this.neigbours[x][y] == 0) {
                for(a = x-1; a < x+2; a++) {
                    for(b = y-1; b < y+2; b++) {
                        if((a != x || b != y) && (a >= 0 && a < board_w && b >= 0 && b < board_h)) {
                            if(this.covers[a][b] == 0) {
                                this.covers[a][b] = 1;
                                this.flags[a][b] = 0;
                                tiles_to_clear.push([a, b]);
                            }
                        }
                    }
                }
            }
            tiles_to_clear.shift();
            console.log('shifted');
        }
    }
};

function init() {
    img_floor.src = 'gfx/floor.png';
    img_cover.src = 'gfx/cover.png';
    img_bomb.src = 'gfx/bomb.png';
    img_flag.src = 'gfx/flag.png';

    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    document.body.appendChild(canvas);

    canvas.addEventListener('mousedown', mouse_down);

    start();
}

function start() {
    board.init_board(board_w, board_h, bombs);
    window.requestAnimationFrame(game_loop);
}

function game_loop() {
    update();
    render();
    window.requestAnimationFrame(game_loop);
}

function update() {

}

function render() {
    ctx.fillStyle = 'gray';
    ctx.fillRect(0, 0, width, height);
    board.render();
}

function end_game()  {
    board.render_bombs = true;
}

function mouse_down(e) {
    e.preventDefault();
    let mouse = windowToCanvas(canvas, e.clientX, e.clientY);
    board.cell_selected(Math.floor(mouse.x/cell_w), Math.floor(mouse.y/cell_w), e.button);
}

window.onload = function() {
    init();
    canvas.addEventListener('contextmenu', function(e) {
        if (e.button == 2) {
          // Block right-click menu thru preventing default action.
          e.preventDefault();
        }
    });
};

function windowToCanvas(canvas, x, y) {
    var bbox = canvas.getBoundingClientRect();
    return { x: x - bbox.left * (canvas.width  / bbox.width),
             y: y - bbox.top  * (canvas.height / bbox.height)
           };
}