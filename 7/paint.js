function createPainter(parent, width, height) {
    let title = elt("h2", null, "Simple Painter")
    let [canvas, ctx] = createCanvas(width, height);

    let toolbar = elt("div", null);
    for(let name in controls) {
        toolbar.appendChild(controls[name](ctx));
    }

    toolbar.style.fontSize = "small";
    toolbar.style.marginBottom = "3px";

    parent.appendChild(elt("div", null, title, toolbar,canvas));
}

function createCanvas(canvasWidth, canvasHeight) {
    let canvas = elt("canvas", {width: canvasWidth, height: canvasHeight});
    let ctx = canvas.getContext("2d");
    canvas.style.border = "1px solid gray";
    canvas.style.cursor = "pointer";
    canvas.addEventListener("mousedown", function(e) {
        let event = document.createEvent("HTMLEvents");
        event.initEvent("change", false, true);
        colorInput.dispatchEvent(event);
        paintTools[paintTool](e, ctx);
    }, false);
    return [canvas, ctx];
}

function relativePosition(event, element) {
    let rect = element.getBoundingClientRect();
    return { x: Math.floor(event.clientX - rect.left),
             y: Math.floor(event.clientY - rect.top)
    };
}

let paintTool;
let paintTools = Object.create(null);

paintTools.brush = function(e,ctx) {
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    let img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    let p = relativePosition(e, ctx.canvas);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);

    setDragListeners(ctx, img, function(q) {
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
    });
};

paintTools.line = function(e, ctx) {
    ctx.lineCap = "round";
    let img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    let p = relativePosition(e, ctx.canvas);

    setDragListeners(ctx, img,function(q) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x , q.y);
        ctx.stroke();
    });
};

paintTools.circle = function(e, ctx) {
    let img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    let p = relativePosition(e, ctx.canvas);
    setDragListeners(ctx, img, function(q) {
        let dx = q.x - p.x;
        let dy = q.y - p.y;
        let r = Math.sqrt(dx*dx+dy*dy);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
        ctx.stroke();
    });
};

paintTools.circleFill = function(e,ctx) {
    let img = ctx.getImageData(0,0, ctx.canvas.width, ctx.canvas.height);
    let p = relativePosition(e, ctx.canvas);
    setDragListeners(ctx, img, function(q) {
        let dx = q.x - p.x;
        let dy = q.y - p.y;
        let r = Math.sqrt(dx*dx+dy*dy);
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, 2*Math.PI, false);
        ctx.fill();
    });
};

function setDragListeners(ctx, img, draw) {
    let mousemoveEventListener = function(e) {
        ctx.putImageData(img,0,0);
        draw(relativePosition(e, ctx.canvas));
    };

    document.addEventListener("mousemove", mousemoveEventListener, false);
    document.addEventListener("mouseup", function(e) {
        ctx.putImageData(img, 0, 0);
        draw(relativePosition(e, ctx.canvas));
        document.removeEventListener("mousemove", mousemoveEventListener,false);
        document.removeEventListener("mouseup", arguments.callee, false);
    }, false);
}

let controls = Object.create(null);
let colorInput;

controls.painter = function(ctx) {
    let DEFAULT_TOOL = 0;
    let select = elt("select", null);
    let label = elt("label", null, "그리기 도구: ", select);
    for(let name in paintTools) {
        select.appendChild(elt("option", {value: name}, name));
    }
    select.selectedIndex = DEFAULT_TOOL;
    paintTool = select.children[DEFAULT_TOOL].value;
    select.addEventListener("change", function(e) {
        paintTool = this.children[this.selectedIndex].value;
    }, false);
    return label;
};

controls.color = function(ctx) {
    let input = colorInput = elt("input", {type: "color"});
    let label = elt("label", null, "색: ", input);
    input.addEventListener("change", function(e) {
        ctx.strokeStyle = this.value;
        ctx.fillStyle = this.value;
    }, false);
    return label;
};

controls.brushsize = function(ctx) {
    let size = [1,2,3,4,5,6,8,10,12,14,16,20,24,28];
    let select = elt("select", null);
    for(let i=0; i<size.length; i++) {
        select.appendChild(elt("option", {value: size[i].toString()}, size[i].toString()));
    }
    select.selectedIndex = 2;
    ctx.lineWidth = size[select.selectedIndex];
    let label = elt("label", null, "선의 너비 :", select);
    select.addEventListener("change", function(e) {
        ctx.lineWidth = this.value;
    },false);
    return label;
};

controls.alpha= function(ctx) {
    let input = elt("input", {type: "number", min: "0", max: "1", step: "0.05", value: "1"});
    let label = elt("label", null, "투명도:", input);
    input.addEventListener("change", function(e) {
        ctx.globalAlpha = this.value;
    }, false);
    return label;
};
