graph = {
    scene: scene,
    sky: sky,
    shadow: shadow,
    normaldepth: normaldepth,
    ssao: ssao,
    blur: blur,
    mix: mix,
    shaders: {
        multiply: 'multiply.shader',
        pass: 'pass.shader',
    },
    init: function(glee, params){
        var self = this;
        var gl = glee.gl;

        
        this.depthstencil = new glee.DepthStencilBuffer({width: glee.width, height: glee.height});
        //this.fbo = new glee.FBO();
        this.result = new glee.Texture();

        this.white = new glee.Texture({
            width: 4,
            height: 4,
            filter: glee.gl.NEAREST,
            repeat: true,
            data: new Uint8Array([
                0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255, 
                0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255, 
                0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255, 
                0,0,0,255, 0,0,0,255, 0,0,0,255, 0,0,0,255
            ])
        });
        
        $('input[name="enable"]').button({
            icons: {
                secondary: 'ui-icon-power'
            }
        });
        $('input[name="edit"]').button({
            text: false,
            icons: {
                secondary: 'ui-icon-pencil'
            }
        });
        $('#edit-scene').button({
            text: true
        });
        $('input[name="view"]').button({
            text: false,
            icons: {
                secondary: 'ui-icon-star'
            }
        });
        $('div.node').buttonset();
        
        this.sky.init(glee, {
            fbo: this.fbo,
            depthstencil: this.depthstencil,
            proj: params.proj,
            view: params.view,
            display_result: this.result,
        });
        
        this.normaldepth.init(glee, {
            view: params.view,
            proj: params.proj,
            draw: function(){
                self.scene.city.draw();
            },
            fbo: this.fbo,
            depthstencil: this.depthstencil,
        });
        
        this.shadow.init(glee, {
            fbo: this.fbo,
            sky: this.sky,
            scene: this.scene,
        });
        sky.shadow = this.shadow;
            
        this.scene.init(glee, {
            fbo: this.fbo,
            depthstencil: this.depthstencil,
            sky: this.sky,
            shadow: this.shadow,
            proj: params.proj,
            view: params.view
        });
        
        this.ssao1 = new this.ssao.SSAO(glee, this.ssao, {
            fbo: this.fbo,
            sky: this.sky,
            scene: this.scene,
            normaldepth: this.normaldepth,
            view: params.view,
            proj: params.proj,
            enabler: $('#enable-ssao1'),
            name: 'SSAO 1',
        });
        
        this.ssao2 = new this.ssao.SSAO(glee, this.ssao, {
            fbo: this.fbo,
            sky: this.sky,
            scene: this.scene,
            normaldepth: this.normaldepth,
            view: params.view,
            proj: params.proj,
            enabler: $('#enable-ssao2'),
            name: 'SSAO 2',
        });

        this.blur3 = new this.blur.Blur(glee, this.blur, {
            fbo: this.fbo,
            source: this.ssao1.result,
            normaldepth: this.normaldepth.result,
            enabler: $('#enable-blur3'),
            name: 'Blur 3',
        });

        this.mix.init(glee, {
            fbo: this.fbo,
        });

        var property_handler = function(name, obj, source){
            $('#edit-' + name).click(function(){
                $('#properties').children().detach();
                $('#properties').append(obj);
            });
            
            $('#view-' + name).click(function(){
                self.pass.samplers.source = source;
            });
        }
        

        $('#properties').empty().append(this.sky.parameters);

        this.multiply = new glee.Processor({
            fbo: this.fbo,
            result: this.result,
            shader: this.shaders.multiply,
            samplers: {
                source: this.scene.result,
            },
            stencil: {
                test: true,
                mask: 0,
                func: {
                    test: gl.EQUAL,
                    ref: 0,
                    mask: 255 
                },
                op: {
                    fail: gl.KEEP,
                    depth_fail: gl.KEEP,
                    pass: gl.KEEP
                }
            },
            depthstencil: this.depthstencil,
        });
        
        property_handler('scene', this.sky.parameters, this.multiply.result);
        property_handler('ssao1', this.ssao1.parameters, this.ssao1.result);
        property_handler('ssao2', this.ssao2.parameters, this.ssao2.result);
        property_handler('blur3', this.blur3.parameters, this.blur3.result);
        
        this.pass = new glee.Processor({
            shader: this.shaders.pass,
            samplers: {
                source: this.multiply.result,
            },
        });
        
        this.sky.render();
    },
    render: function(){
        normaldepth.render();

        var op1, op2, combined;
        if(this.ssao1.enabled){
            this.ssao1.render();
            op1 = this.ssao1.result;
        }
        
        if(this.ssao2.enabled){
            this.ssao2.render();
            op2 = this.ssao2.result;
        }

        if(op1 && op2){
            this.mix.set_ops(op1, op2);
            this.mix.render();
            combined = this.mix.result;
        }
        else if(op1){
            combined = op1;
        }
        else if(op2){
            combined = op2;
        }
        else{
            combined = this.white;
        }

        if(this.blur3.enabled){
            this.blur3.source = combined;
            this.blur3.render();
            this.multiply.samplers.occlusionmap = this.blur3.result;
        }
        else{
            this.multiply.samplers.occlusionmap = combined;
        }
            
        this.sky.blit();
        this.scene.render();
        this.multiply.render();
        this.pass.render();
    },
}
