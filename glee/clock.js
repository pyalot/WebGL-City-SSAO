/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.prototype.FPS = function(params){
    var counts = [];
    var count = 0;
    var last = (new Date()).getTime();

    this.tick = function(){
        count += 1;
    }

    setInterval(function(){
        var now = (new Date()).getTime();
        var delta = now - last;
        last = now;
        var fps = (1000*count)/delta;
        count = 0;
        counts.push(fps);
        while(counts.length > params.average_over){
            counts.shift();
        }
        var avg = 0;
        for(var i=0; i<counts.length; i++){
            avg += counts[i];
        }
        avg /= counts.length;
        params.update(avg);
    }, params.interval);
}
