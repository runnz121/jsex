function elt(name, attributes) {
    var node = document.createElement(name);
    if(attributes) {
        for(var attr in attributes) {
            if(attributes.hasOwnProperty(attr)) {
                node.setAttribute(attr, attributes[attr]);
            }
        }
    }

    for(var i=2; i<arguments.length; i++) {
        var child =arguments[i];
        if(typeof child =="string") {
            child = document.createTextNode(child);

        }
        node.appendChild(child);
    }

    return node;
}




window.onload = function() {
    createIconEditor(document.body,16,16);
};

function createIconEditor(parent, nx, ny) {
    var color = elt("input", {type: "color"});
    var clear = elt("input", {type: "button", value: "모두 삭제"});
    clear.onclick = function(e) {
        e.cells.forEach(function(td) {td.style.backgroundColor = "white";});
    };

    var table = elt("table");
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "5px";
    var cells =[];
    for(var j=0; j<ny; j++) {
        var tr = elt("tr");
        table.appendChild(tr);
        for(var i=0; i<nx; i++) {
            var td = elt("td");
            cells.push("td");
            td.style.width = td.style.height  = "15px";
            td.style.border = "1px solid gray";
            tr.appendChild(td);
            td.onclick = function changeColor(e) {
                e.target.style.backgroundColor = color.value;
            };
        }
    }

    parent.appendChild(color);
    parent.appendChild(clear);
    parent.appendChild(table);

}
