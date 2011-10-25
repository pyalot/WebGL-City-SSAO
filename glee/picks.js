Glee.prototype.random_picks = function(N){
    var picks = [];
    for(var i=0; i<N; i++){
        var x = Math.random()-0.5;
        var y = Math.random()-0.5;
        var z = Math.random()-0.5;
        var l = Math.sqrt(x*x+y*y+z*z);
        x/= l;
        y/= l;
        z/= l;
        l = Math.random();
        sphere_picks.push(x*l, y*l, z*l);
    }
    return picks;
}

Glee.prototype.hemisphere_picks = function(amount){
    var N = amount*2;
    var picks = [];
    var inc = Math.PI * (3 - Math.sqrt(5));
    var off = 2/N;
    for(var k=0; k<N; k++){
        var y = k * off - 1.0 + (off/2);
        var r = Math.sqrt(1 - y*y);
        var phi = k*inc;
        if(y > 0.0){
            picks.push(Math.cos(phi)*r, y, Math.sin(phi)*r);
        }
    }
    return picks;
}

Glee.prototype.kernel_picks = function(size, step){
    var kernel = [];
    var size = size || 2;
    var step = step || Math.PI/8;
    for(var a=-size; a<=size; a++){
        for(var b=-size; b<=size; b++){
            var x = Math.sin(a*step);
            var z0 = Math.cos(a*step);
            var y = Math.sin(b*step)*z0;
            var z = Math.cos(b*step)*z0;
            kernel.push(x, y, z);
        }
    }
    return kernel;
}
