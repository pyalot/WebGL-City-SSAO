blur = {
    root: 'blur',
    shaders: {
        blur: 'blur.shader',
    },
    Blur: function(glee, klass, params){
        var self = this;

        this.source = params.source;
        this.enabler = params.enabler;

        this.blur_h = new glee.Processor({
            fbo: params.fbo,
            result: new glee.Texture({width: glee.width, height: glee.height}),
            shader: klass.shaders.blur,
            samplers: {
                normaldepth: params.normaldepth,
            },
            uniforms: {
                axis: [1, 0],
            },
        });
   
        this.blur_v = new glee.Processor({
            fbo: params.fbo,
            result: new glee.Texture({width: glee.width, height: glee.height}),
            shader: klass.shaders.blur,
            samplers: {
                normaldepth: params.normaldepth,
                source: this.blur_h.result,
            },
            uniforms: {
                axis: [0, 1],
            },
        });

        this.result = this.blur_v.result;

        this.repeat = 4;
        this.render = function(){
            this.blur_h.samplers.source = this.source;
            for(var i=0; i<this.repeat; i++){
                this.blur_h.render();
                this.blur_h.samplers.source = this.blur_v.result;
                this.blur_v.render();
            }
        }
        
        this.parameters = $('<div></div>');
        $('<h1></h1>').text(params.name).appendTo(this.parameters);
        slider({
            title: 'Repeat',
            min: 1,
            max: 20,
            value: 4,
            step: 1,
            slide: function(value){
                self.repeat = value
            }
        }).appendTo(this.parameters);

        slider({
            title: 'Distance',
            min: 1,
            max: 1000,
            value: 90,
            step: 1,
            slide: function(value){
                self.blur_h.uniforms.distance_factor = value;
                self.blur_v.uniforms.distance_factor = value;
            }
        }).appendTo(this.parameters);
       
        slider({
            title: 'Depth Power',
            min: 0.01,
            max: 3,
            value: 0.3,
            step: 0.01,
            slide: function(value){
                self.blur_h.uniforms.depth_power = value;
                self.blur_v.uniforms.depth_power = value;
            }
        }).appendTo(this.parameters);
        
        slider({
            title: 'Normal Factor',
            min: 0.01,
            max: 3,
            value: 1.0,
            step: 0.01,
            slide: function(value){
                self.blur_h.uniforms.normal_factor = value;
                self.blur_v.uniforms.normal_factor = value;
            }
        }).appendTo(this.parameters);
        
        slider({
            title: 'Normal Power',
            min: 0.01,
            max: 3,
            value: 1.0,
            step: 0.01,
            slide: function(value){
                self.blur_h.uniforms.normal_power = value;
                self.blur_v.uniforms.normal_power = value;
            }
        }).appendTo(this.parameters);

        this.check = function(){
            if(this.enabler.attr('checked')){
                self.enabled = true;
            }
            else{
                self.enabled = false;
            }
        };
        params.enabler.change(function(){
            self.check();
        });
        this.check();
    },
};
