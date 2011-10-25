/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.prototype.schedule = function(onrun){
    var last = new Date().getTime();
    var request = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

    var step = function(){
        request(step);
        var current = new Date().getTime();
        var delta = current-last;
        delta = Math.max(1, Math.min(delta, 500));
        last = current;
        onrun(delta/1000, current);
    }
    request(step);
};
