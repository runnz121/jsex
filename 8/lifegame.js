"use strict"
let state = Object.create(null);
let view = Object.create(null);
let controls = Object.create(null);

window.onload = function() {
    readFile("./patterns.json", function(jsonObj, error) {
        if(error) {
            delete controls.pattern;
        } else {
            state.patterns = jsonObj;
        }
    createLifeGame(document.body, 78,60,780,600);
});
};

function readFile (filename, callback) {
    let req= new XMLHttpRequest();
    req.onreadystatechange = function() {
        if(req.readyState == 4) {
            if(req.status == 200) {
                callback(req.response, false);
            }
            else {
                callback(null, true);
            }
        }
    };
    req.open("GET", filename, true);
    req.responseType = "json";
    req.send(null);
}

function createLifeGame(parent, nx, ny, width, height) {
    let title = elt("h1", {class: "title"}, "Life Game");
    let viewpanel = view.create(nx, ny, width, height);
    state.create(nx,ny);

    let toolbar = elt("div",{class: "toolbar"});

    for(let name in controls) {
        toolbar.appendChild(controls[name](state));
    }
    parent.appendChild(elt("div", null, title, toolbar, viewpanel))
}

state.create = function(nx,ny) {
    state.nx = nx;
    state.ny = ny;
    state.cells = new Array(ny);
    for(let ix=0; ix<nx; ix++) {
        state.cells[ix] = new Array(ny);
        for(let iy=0; iy<ny; iy++) {
            state.cells[ix][iy] = 0;
        }
    }

    document.addEventListener("clickview", function(e) {
        state.setLife(e.detail.ix, e.detail.iy, e.detail.life);
    }, false);
    state.changeCellEvent = document.createEvent("HTMLEvents");
    state.changeGenerationEvent = document.createEvent("HTMLEvents");
    state.generation = 0;
    state.tellGenerationChange(0);
    state.playing = false;
    state.timer = null;
};

state.tellCellChange = function(ix, iy, life) {
    state.changeCellEvent.initEvent("changecell", false, false);
    state.changeCellEvent.detail = {ix: ix, iy: iy, life: life};
    document.dispatchEvent(state.changeCellEvent);
};

state.tellGenerationChange = function(generation) {
    state.changeGenerationEvent.initEvent("changegeneration", false, false);
    state.changeGenerationEvent.detail = {generation: generation};
    document.dispatchEvent(state.changeGenerationEvent);
};


state.getSumAround = function(ix, iy) {
    let dx = [0,1,1,1,0,-1,-1,-1];
    let dy = [1,1,0,-1,-1,-1,0,1];
    for(let k=0, sum=0; k<dx.length; k++) {
        if(state.cells[(ix+dx[k] + state.nx)%state.nx][(iy+dy[k]+state.ny)%state.ny]) {
            sum++;
        }

        return sum;
    }

};

state.update = function() {
    let changedCell = [];
    for(let ix =0; ix<state.nx; ix++) {
        for(let iy=0; iy<state.ny; iy++) {
            let sum = state.getSumAround(ix, iy);
            if(sum <=1 || sum>=4) {
                if(state.cells[ix][iy]) {
                    changedCell.push({x:ix, y:iy});
                    state.tellCellChange(ix, iy, 0);
                }
            } else if(sum==3) {
                if(!state.cells[ix][iy]) {
                    changedCell.push({x:ix, y:iy});
                    state.tellCellChange(ix, iy, 1);
                }
            }
        }
    }

    for(let i =0; i<changedCell.length; i++) {
        state.cells[changedCell[i].x][changedCell[i].y]^= 1;
    }
    state.tellGenerationChange(state.generation++);
};

state.setLife = function(ix, iy, life) {
    if(life ==2) {
        state.cells[ix][iy] ^=1;
        state.tellCellChange(ix, iy, state.cells[ix][iy]);
    } else {
        if(state.cells[ix][iy] != life) {
            state.cells[ix][iy] = life;
            state.tellCellChange(ix, iy, life);
        }
    }
};

state.clearAllCell = function() {
    for(let ix=0; ix<state.nx; ix++) {
        for(let iy=0; iy<state.ny; iy++) {
            state.setLife(ix, iy,0);
        }
    }
    state.tellGenerationChange(state.generation = 0);
};


///////////////////////////

view.create = function(nx, ny, width, height) {
    view.layer = [];
    view.layer[0] = elt("canvas",{id:"rayer0", width:width, height: height});
    view.layer[1] = elt("canvas",{id: "rayer1", width: width, height: height});
    view.nx = nx;
    view.ny = ny;
    view.cellWidth = view.layer[0].width/nx;
    view.cellHeight = view.layer[0].height/ny;

    view.markRadius = (Math.min(view.cellWidth, view.cellHeight)/2.5+0.5) | 0;
    if(view.ctx) delete view.ctx;
    view.ctx= [];
    for(let i=0; i<view.layer.length; i++) {
        view.ctx.push(view.layer[i].getContext("2d"));
    }

    view.backColor = "forestgreen";
    view.markColor = "white";
    view.strokeStyle = "black";
    view.lineWidth = 0.2;

    view.drawLattice();
    view.geneartion = elt("span", {id:"generation"});
    view.statuspanel = elt("div", {class: "status"}, "세대 : ", view.geneartion );

    view.clickEvent = document.createEvent("HTMLEvents");
    view.layer[1].addEventListener("click", function(e) {
        let ix = Math.floor(e.offsetX/view.cellWidth);
        let iy = Math.floor(e.offsetY/view.cellHeight);

        view.clickEvent.initEvent("clickview", false, false);
        view.clickEvent.detail = {ix: ix, iy: iy, life: 2};
        document.dispatchEvent(view.clickEvent);
    }, false);

    document.addEventListener("changecell", function(e) {
        view.drawCell(e.detail.ix, e.detail.iy, e.detail.life);
    },false);

    document.addEventListener("changegeneration", function(e) {
        view.showGeneration(e.detail.generation);
    }, false);

    return elt(
        "div", {class: "viewpanel"}, view.layer[0], view.layer[1], view.statuspanel
    );
};

view.drawLattice = function() {
    for(let i= 0; i<view.layer.length; i++) {
        view.layer[i].width = view.layer[i].width;
    }
    if(view.nx<150) {
        let c = view.ctx[1];
        c.lineWidth = view.lineWidth;
        c.strokeStyle = view.strokeStyle;
        for(let ix= 0; ix<=view.nx; ix++) {
            c.beginPath();
            c.moveTo(ix*view.cellWidth,0);
            c.lineTo(ix*view.cellWidth, view.nx*view.cellHeight);
            c.stroke();
        }
        for(let iy=0; iy<=view.ny; iy++){
            c.beginPath();
            c.moveTo(0, iy*view.cellHeight);
            c.lineTo(view.nx*view.cellWidth, iy*view.cellHeight);
            c.stroke();
        }
    }

    let c=view.ctx[0];
    c.fillStyle = view.backColor;
    c.fillRect(0,0,view.layer[0].width, view.layer[0].height);
};

view.drawCell = function(ix, iy, life) {
    let c = view.ctx[0];
    c.beginPath();
    if(life) {
        let x = (ix+0.5)*view.cellWidth;
        let y = (iy+0.5)*view.cellHeight;
        let r = view.markRadius;
        c.fillStyle = view.markColor;
        c.arc(x,y,r,0,Math.PI*2, true);
        c.fill();
    } else {
        let x = ix*view.cellWidth;
        let y = iy*view.cellHeight;
        c.fillStyle = view.backColor;
        c.fillRect(x,y,view.cellWidth, view.cellHeight);
    }
};

view.showGeneration = function(generation) {
    view.generation.innerHTML = generation;

};

/////////////////

controls.play = function(state) {
    if(!state.timeInterval) state.timeInterval = 300;
    let input = elt("input", {type: "button", value:"연속재생"});

    input.addEventListener("click", function(e) {
        if(!state.playing) {
            state.timer = setInterval(state.update, state.timeInterval);
            state.playing = true;
        }
    });
    return input;
};

controls.changeTimeInterval = function(state) {
    let select = elt("select");

    let options = [
        { name: "초고속(20ms)" , value: 20},
        { name: "고속(100ms)" , value: 100},
        { name: "표준(300ms)" , value: 300},
        { name: "저속(600ms)" , value: 600},
    ];

    for(let i=0; i<options.length; i++) {
        let option = elt("option", null, options[i].name);
        select.appendChild(option);
    }
    select.selectedIndex = 2;
    select.addEventListener("change", function(e) {
        state.timeInterval = options[select.selectedIndex].value;

        if(state.playing) {
            clearInterval(state.timer);
            state.timer = setInterval(state.update, state.timeInterval);
        }
    });
    return select;
};

controls.stop = function(state) {
    let input = elt("input", { type: "button", value: "정지"});
    input.addEventListener("click", function(e) {
        if(state.playing) {
            clearInterval(state.timer);
            state.playing=false;
        }
    });
    return input;
};

controls.step = function(state) {
    let input = elt("input", {type: "button", value: "다음"});
    input.addEventListener("click", function (e) {
        clearInterval(state.timer); state.playing = false;
        state.update();
    });
    return input;
};





controls.pattern = function(state) {
    let select = elt("select");
    select.appendChild(elt("option", null, "패턴 선택"));
    for (let i = 0; i < state.patterns.length; i++) {
        select.appendChild(elt("option", null, state.patterns[i].name));
    }
    select.selectedIndex = 0;

    select.addEventListener("change", function (e) {
        clearInterval(state.timer);
        state.playing = false;
        if (select.selectedIndex != 0) {
            placePattern(state.patterns[select.selectedIndex - 1]);
        }
        select.selectedIndex = 0;
    });
    return select;

    function placePattern(pattern) {
        let array = pattern.points;
        let max = [0, 0];
        let min = [state.nx - 1, state.ny - 1];
        for (let i = 0; i < array.length; i++) {
            for (let d = 0; d < 2; d++) {
                for (let d = 0; d < 2; d++) {
                    if (array[i][d] > max[d]) max[d] = array[i][d];
                    if (array[i][d] < min[d]) min[d] = array[i][d];
                }
            }
            state.clearAllCell();
            for (let i = 0; i < Array.length; i++) {
                let ix = array[i][0] + Math.floor((state.nx - min[0] - max[0]) / 2);
                let iy = array[i][1] + Math.floor((state.nx - min[1] - max[1]) / 2);
                state.setLife(ix, iy, 1);
            }
            state.tellGenerationChange(state.generation = 0);
        }
    };
};

controls.clear = function (state) {
    let input = elt("input", {type: "button", value: "모두 삭제"});
    input.addEventListener("click", function (e) {
        clearInterval(state.timer);
        state.playing = false;
        state.clearAllCell();
    });
    return input;
};

