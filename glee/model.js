/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;
    
    var dirname_re = /(.+)\/[^\/]+\.model$/

    glee.Model = function(path, nodes, onprogress){
        var dirname = path.match(dirname_re)[1];
        var self = this;
        this.texture_count = 0;
        var drawables = [];

        var total = {};
        var pos3f = total.position_3f = [];
        var norm3f = total.normal_3f = [];
        var tex2f = total.texcoord_2f = [];

        Glee.each(nodes, function(i, node){
            var drawable = {samplers: {}};
            Glee.each(node.samplers, function(name, filename){
                this.texture_count += 1; 
                var image = new Image();
                var filepath = dirname + '/' + filename;
                image.onload = function(){
                    drawable.samplers[name] = new glee.Texture({image: image}).repeat().mipmap();
                    onprogress(filepath);
                };
                image.src = filepath;
            });
            drawable.vbo = new glee.VBO(node.vbo);
            pos3f = pos3f.concat(node.vbo.position_3f);
            norm3f = norm3f.concat(node.vbo.normal_3f);
            tex2f = tex2f.concat(node.vbo.texcoord_2f);
            drawables.push(drawable);
        });
        this.vbo = new glee.VBO({
            position_3f: pos3f,
            normal_3f: norm3f,
            texcoord_2f: tex2f
        });
        this.nodes = drawables;
    };

    glee.Model.prototype = {
        draw: function(){
            var current_shader = glee.Shader.current;
            var last_unit = current_shader.last_unit;
            for(var i=0; i<this.nodes.length; i++){
                var node = this.nodes[i];
                var unit = last_unit;
                for(name in node.samplers){
                    current_shader.sampler(name, unit);
                    node.samplers[name].bind(unit);
                    unit += 1;
                };
                node.vbo.draw();
            }
        }
    };
});
