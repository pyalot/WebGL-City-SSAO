scene = {
    root: 'scene',
    simple: 'simple.shader',
    //city: 'city.vbo',
    //city: 'city2.vbo',
    //city: 'city3.vbo',
    city_model: 'city/city.model',
    init: function(glee, params){
        this.city = this.city_model.vbo;
        var self = this;
        var gl = glee.gl;

        this.sky = params.sky;
        
        var samples = [];
        while(samples.length < 16){
            var x = (Math.random()-0.5)*2.0;
            var y = (Math.random()-0.5)*2.0;
            var z = (Math.random()-0.5)*2.0;
            var l = Math.sqrt(x*x+y*y+z*z);
            if(l < 1.0 && l > 0.1){
                samples.push(x, y, z);
            }
        }
        
        this.result = new glee.Texture();
        
        this.processor = new glee.Processor({
            fbo: params.fbo,
            result: this.result,
            clear: {
                color: [0, 0, 0, 1],
                depth: 1,
                stencil: 1
            },
            shader: this.simple,
            uniforms: {
                view: params.view.matrix,
                view_rot: params.view.rot,
                inv_view_rot: params.view.inv_rot,
                proj: params.proj.matrix,
                inv_proj: params.proj.inverse,
                lightdir: params.sky.lightdir,
                near: params.proj.near,
                far: params.proj.far,
                shadow_near: params.shadow.proj.near,
                shadow_far: params.shadow.proj.far,
                shadow_view: shadow.view,
                shadow_proj: params.shadow.proj.matrix,
            },
            uniform3f: {
                samples: samples,
            },
            samplers: {
                diffuse_sun: params.sky.diffuse_sun.result,
                diffuse_env: params.sky.diffuse_env.result,
                specular_sun: params.sky.specular_sun.result,
                specular_env: params.sky.specular_env.result,
                shadowmap: params.shadow.result,
            },
            draw: function(){
                gl.clearColor(0, 0, 0, 1);
                gl.clearDepth(0);
                gl.clearStencil(0);
                glee.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
                //self.city.draw();
                self.city_model.draw();
            },
            depth: {
                test: 'Less',
                write: true,
            },
            stencil: {
                test: true,
                mask: 255,
                func: {
                    test: gl.ALWAYS,
                    ref: 0,
                    mask: 255
                },
                op: {
                    fail: gl.REPLACE,
                    depth_fail: gl.REPLACE,
                    pass: gl.REPLACE
                }
            },
            depthstencil: params.depthstencil,
        });
    },
    render: function(){
        this.processor.render();
    }
}
