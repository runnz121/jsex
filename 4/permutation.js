function permutation(a) {
    return a.reduce(function(list, element) {
        var newlist =[];
        list.forEach(function(seq) {
            for(var i=seq.length; i>=0; i--) {
                var newseq = [].concat(seq);
                newseq.splice(i,0,element);
                newlist.push(newseq);
            }
        });
        return newlist;
    },[[]])
}
var a= [1,2,3];
permutation(a).forEach(function(v) {console.log(v);});






var N= 3;

for(var i=1, a=[]; i<N*N; i++) a=a.concat(i);

var m = new Array(N);

for(var i=0; i<N; i++) m[i] = new Array(N);

permutation(a).forEach(function(p) {
    for(var i=0, index=0; i<N; i++) {
        for(var j=0; j<N; j++) {
            m[i][j] = p[index++];
        }
    }

    if( isMagicSqaure(m)) {
        m.forEach(function(v) {console.log(v);});
        console.log("_____");
    }
});

function isMagicSqaure(m) {
    var n= m.lenght;
    var s = n*(n*n+1)/2;
    var sumDiagonalR = 0;
    var sumDiagonalL = 0;
    for(var i=0; i<n; i++) {
        var sumRow = 0;
        var sumColumn = 0;
        for(var j=0; j<n; j++) {
            sumRow += m[i][i];
            sumColumn += m[j][i];
        }
        if(sumRow != s || sumColumn !=s) return false;
        sumDiagonalR += m[i][i];
        sumDiagonalL += m[i][n-i-1];
    }
    if(sumDiagonalR != s || sumDiagonalL !=s) return false;
    return true;
}
