shadow = {
    root: 'shadow',
    shader: 'shadow.shader',
    init: function(glee, params){
        var self = this;
        this.sky = params.sky;

        var size = 50;
        var proj = this.proj = new glee.Ortho({
            left: size/2,
            right: -size/2,
            top: -size/2,
            bottom: size/2,
            near: -30,
            far: 30,
        });

        var view = this.view = new glee.Mat4();

        var width = 4092;
        var height = 4092;

        this.result = new glee.Texture({
            width: width,
            height: height,
            //filter: glee.gl.NEAREST,
        });

        this.processor = new glee.Processor({
            result: this.result,
            fbo: params.fbo,
            clear: {
                color: [0,0,0,1],
                depth: 1,
            },
            shader: this.shader,
            uniforms: {
                view: view,
                proj: proj.matrix,
                near: proj.near,
                far: proj.far,
            },
            draw: function(){
                params.scene.city.draw();
            },
            depth: {
                test: 'Less',
                write: true,
            },
            depthstencil: new glee.DepthStencilBuffer({width: width, height: height})
        });
    },
    render: function(){
        this.view.ident().rotatex(this.sky.elevation+90).rotatey(this.sky.orientation);
        this.processor.render();
    }
}
