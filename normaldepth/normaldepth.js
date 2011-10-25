var normaldepth = {
    root: 'normaldepth',
    shaders: {
        normaldepth: 'normaldepth.shader',
        normal: 'normal.shader',
    },
    init: function(glee, params){
        this.result = new glee.Texture({
            width: glee.width,
            height: glee.height,
            filter: glee.gl.NEAREST,
        }); 
        this.normal = new glee.Texture({
            width: glee.width,
            height: glee.height,
            filter: glee.gl.NEAREST,
        });

        this.normaldepth_processor = new glee.Processor({
            fbo: params.fbo,
            result: this.result,
            clear: {
                color: [0, 0, 0, 1],
                depth: 1,
            },
            shader: this.shaders.normaldepth,
            uniforms: {
                view: params.view.matrix,
                view_rot: params.view.rot,
                proj: params.proj.matrix,
                near: params.proj.near,
                far: params.proj.far,
            },
            depth: {
                test: 'Less',
                write: true,
            },
            draw: params.draw,
            depthstencil: params.depthstencil,
        });
        
        this.normal_processor = new glee.Processor({
            fbo: params.fbo,
            result: this.normal,
            clear: {
                color: [0, 0, 0, 1],
                depth: 1,
            },
            shader: this.shaders.normal,
            uniforms: {
                view: params.view.matrix,
                view_rot: params.view.rot,
                proj: params.proj.matrix,
                near: params.proj.near,
                far: params.proj.far,
            },
            depth: {
                test: 'Less',
                write: true,
            },
            draw: params.draw,
            depthstencil: params.depthstencil,
        });
    },
    render: function(){
        this.normaldepth_processor.render();
        this.normal_processor.render();
    }
}
