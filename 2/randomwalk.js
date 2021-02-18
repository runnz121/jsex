function* randomWalk(c, x0, y0, d) {
    var dx = [1,0,-1,0], dy = [0,1,0,-1];
    var x = x0;
    var y = y0;
    c.strokeStyle = "red";
    c.globalAlpha = 0.25;
    while(true) {
        yield;
        c.beginPath();
        c.moveTo(x,y);
        var dir = Math.floor(Math.random()*4);
        x += d*dx[dir];
        y += d*dy[dir];
        c.lineTo(x,y);
        c.stroke();
    }
}

window.onload = function() {
    var canvas = document.getElementById("mycanvas");
    var ctx = canvas.getContext("2d");
    var iter = randomWalk(ctx, 300,300,4,"red");
    setInterval(function() {iter.next();}, 10);
};
