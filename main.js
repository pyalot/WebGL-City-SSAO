/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

$(function(){
    var canvas = $('canvas')[0];
    var glee = new Glee(canvas, handlers).load({
        graph: graph,
        onload: function(gl){
            var self = this;

            glee.resize(canvas.width, canvas.height);

            var statistic = new Statistic();

            var cube = new glee.Cube(0.15);
            var sphere = new glee.Sphere(1.0);

            var keys = new glee.Keys();
            var view = new glee.Viewpoint({
                position: new glee.Vec3(0.0, 5.0, 2.0),
                keys: keys,
                speed: 0.2,
            });
            
            var proj = new glee.Perspective({
                width: canvas.width,
                height: canvas.height,
                fov: 75,
                near: 0.001,
                far: 40,
            });
            
            this.graph.init(glee, {
                view: view,
                proj: proj,
            });
            
            glee.schedule(function(delta, current){
                view.step(delta);
                self.graph.render();
                glee.gl.finish();

                var now = (new Date()).getTime();
                var render_time = now - current;
                statistic.tick(render_time);
                //statistic.tick(delta*1000);
            });
        }
    });
});
