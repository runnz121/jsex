window.onload = function () {
    let canvas =document.getElementById("mycanvas");
    let ctx = canvas.getContext("2d");
    let width = canvas.width;
    let height = canvas.height;

    let xc = -0.6, yc = 0;

    draw();

    document.getElementById("button").onclick = draw;
    document.getElementById("mycanvas").onclick = function (event) {
        let ix = event.offsetX;
        let iy = event.offsetY;
        let mag = parseFloat(document.getElementById("magnification").value);
        xc += (2*ix/width -1)/mag;
        yc += (2*iy-height)/mag/width;
        draw();
    };

    function draw() {
        let mag = document.getElementById("magnification").value;
        let maxit = document.getElementById("maxit").value;
        displayCenter(xc, yc);
        mandelbrot(ctx, xc, yc, mag, maxit);
    }

};

function displayCenter(xc, yc) {
    document.getElementById("xc").innerHTML = xc.toFixed(3);
    document.getElementById("yc").innerHTML = yc.toFixed(3);
}

function mandelbrot(c, xc, yc, mag, maxit) {
    let w = c.canvas.width;
    let h = c.canvas.height;
    let xmin = xc - 1/mag;
    let xmax = xc + 1/mag;
    let ymin = yc -(xmax-xmin)*h/w/2;
    let ymax = yc +(xmax-xmin)*h/w/2;
    let dx = (xmax-xmin)/w;
    let dy = (ymax-ymin)/h;

    let color =[];
    color[0] = "black";

    let L=255, dL = 255/maxit;
    for(let i=maxit; i>0; i--) {
        color[i] = "rgb(255," + Math.floor(L) + ",255)"; L-=dL;
    }
    for(let i=0; i<w; i++) {
        let x = xmin +i*dx;

        for(let j=0; j<h; j++) {
            let y = ymin + j*dy;
            let a= x, b=y;
            let a2 = a*a, b2 = b*b;

            for(var count = maxit; a2+b2<=4 && count; count--) {
                b=2*a*b + y; a=a2-b2 +x;
                a2 = a*a; b2 = b*b;
            }
            c.fillStyle = color[count];
            c.fillRect(i,j,1,1);
        }
    }
}
