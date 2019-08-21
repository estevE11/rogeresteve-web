var
canvas, ctx,
width = 640, height = 480,
socket, con_id,

board = {
    grid: [],
    offX: 10,
    offY: 10,
    
    init: function() {
        this.grid = new Array(3);
        for(let i = 0; i < 3; i++) {
            this.grid[i] = new Array(3).fill(Math.floor(Math.random()*2)+1);
        }
    },

    render: function() {
        //render grid limits
        ctx.beginPath();
        ctx.moveTo(this.offX, this.offY + 100);
        ctx.lineTo(this.offX + 320, this.offY + 100);
        ctx.moveTo(this.offX, this.offY + 220);
        ctx.lineTo(this.offX + 320, this.offY + 220);
        ctx.moveTo(this.offX + 220, this.offY);
        ctx.lineTo(this.offX + 220, this.offY + 320);
        ctx.moveTo(this.offX + 100, this.offY);
        ctx.lineTo(this.offX + 100, this.offY + 320);
        ctx.stroke();

        for(let x = 0; x < 3; x++) {
            for(let y = 0; y < 3; y++) {
                ctx.fillStyle = 'black';
                if(this.grid[x][y] == 1) render_O(this.offX + 40+x*120, this.offY + 40+y*120, 80, 80);
                if(this.grid[x][y] == 2) render_X(this.offX + x*120, this.offY + y*120, 80, 80);
            }
        }
    },

    check_end: function() {

    }
};

function init() {
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    start();
}

function start() {
    board.init();
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
    board.render();
}

function render_X(x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+w, y+w);
    ctx.moveTo(x+w, y);
    ctx.lineTo(x, y+h);
    ctx.stroke();
}

function render_O(x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x, y, w/2, h/2, 0, 0, 2*Math.PI);
    ctx.stroke();
}

window.onload = function() {
    init();
}