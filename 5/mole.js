function makeMoles(nx, ny) {


    var moleState = new Map();
    var W = 50, SPACE = 10;


    for(var i=0; i<nx; i++) {
        for(var j=0; j<ny; j++) {
            var element = document.createElement("div");

            element.style.width = W + "px";
            element.style.height = W + "px";
            element.style.background = "url(./mole.jpg)";
            element.style.position = "absolute";
            element.style.opacity = 0.2;
            element.style.transition = "transform 0.5s ease-in-out, opacity 0.5s ease";

            document.body.appendChild(element);

            element.style.left = SPACE + i*(W+SPACE) + "px";
            element.style.top = 2*SPACE + j*(W+SPACE) + "px";

            moleState.set(element, {x: i, y: j, opacity: 0.2});

            element.onclick = function clickEventHandler(e) {
                var element = e.currentTarget;
                var state = moleState.get(element);

                if(state.opacity >=0.5) {
                    document.body.removeChild(element);
                    moleState.delete(element);
                }
            };

        }
    }
    return moleState;
}
window.onload = function() {
    var TIME_INTERVAL = 1500, DISPLAY_TIME = 1050;
    var moleState = makeMoles(7,4);

    var timer = setInterval(function appearMole() {
        if(moleState.size ==0) {
            clearInterval(timer);
            document.body.innerHTML = "game over";
            return;
        }

        var n = Math.floor(Math.random()*moleState.size);
        var elements = moleState.keys();
        var count = 0;
        for(var element of elements) {
            if(count++ == n) break;
        }
        var state = moleState.get(element);

        element.style.opacity = 1;
        state.opacity = 1;
        element.style.transform = "translateY(-10px)";

        setTimeout(function hideMole() {
            element.style.opacity = 0.2;
            state.opacity = 0.2;
            element.style.transform = "translateY(0)";
        }, DISPLAY_TIME);
    }, TIME_INTERVAL);
};
