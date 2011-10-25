var sky = {
    root                : 'sky',
    shaders: {
        display             : 'display.shader',
        scattering          : 'scattering.shader',
        cubemap_convolve    : 'cubemap_convolve.shader',
        downsample          : 'downsample.shader',
        cube_pass           : 'cube_pass.shader',
    },
    elevation: 60.0,
    orientation: 20.0,
    init: function(glee, params){
        var self = this;
        
        this.settings = {
            Kr: [0.18867780436772762, 0.4978442963618773, 0.6616065586417131],
            rayleigh_brightness: 3.3,
            mie_brightness: 0.1,
            spot_brightness: 800,
            scatter_strength: 0.028,
            rayleigh_strength: 0.139,
            mie_strength: 0.264,
            rayleigh_collection_power: 0.81,
            mie_collection_power: 0.39,
            mie_distribution: 0.63,
        };

        this.fbo = new glee.FBO();
        this.lightdir = new glee.Vec3();
        this.lightMat = new glee.Mat3();
        this.display = new glee.CubeProcessor({
            width: 128,
            height: 128,
            fbo: this.fbo,
            shader: this.shaders.display,
            uniforms: {
                lightdir: this.lightdir,
            }
        });

        this.irradiance_sun = new glee.CubeProcessor({
            width: 128,
            height: 128,
            filter: glee.gl.NEAREST,
            fbo: this.fbo,
            shader: this.shaders.scattering,
            uniforms: {
                lightdir: this.lightdir,
            }
        });
        
        this.irradiance_env = new glee.CubeProcessor({
            width: 128,
            height: 128,
            filter: glee.gl.NEAREST,
            fbo: this.fbo,
            shader: this.shaders.scattering,
            uniforms: {
                lightdir: this.lightdir,
            }
        });
        
        this.level1 = new glee.CubeProcessor({
            width: 64,
            height: 64,
            filter: glee.gl.NEAREST,
            fbo: this.fbo,
            shader: this.shaders.downsample,
            samplers: {
                source: this.irradiance_sun.result,
            }
        });
        
        this.level2 = new glee.CubeProcessor({
            width: 32,
            height: 32,
            filter: glee.gl.NEAREST,
            fbo: this.fbo,
            shader: this.shaders.downsample,
            samplers: {
                source: this.level1.result,
            }
        });
        
        this.level3 = new glee.CubeProcessor({
            width: 16,
            height: 16,
            filter: glee.gl.NEAREST,
            fbo: this.fbo,
            shader: this.shaders.downsample,
            samplers: {
                source: this.level2.result,
            }
        });

        this.diffuse_sun = new glee.CubeProcessor({
            width: 16,
            height: 16,
            fbo: this.fbo,
            shader: this.shaders.cubemap_convolve,
            uniforms: {
                specularity: 1.0
            },
            samplers: {
                source: this.level3.result
            }
        });
        
        this.specular_sun = new glee.CubeProcessor({
            width: 16,
            height: 16,
            fbo: this.fbo,
            shader: this.shaders.cubemap_convolve,
            uniforms: {
                specularity: 2.0
            },
            samplers: {
                source: this.level3.result
            }
        });
        
        this.diffuse_env = new glee.CubeProcessor({
            width: 16,
            height: 16,
            fbo: this.fbo,
            shader: this.shaders.cubemap_convolve,
            uniforms: {
                specularity: 1.0
            },
            samplers: {
                source: this.level3.result
            }
        });
        
        this.specular_env = new glee.CubeProcessor({
            width: 16,
            height: 16,
            fbo: this.fbo,
            shader: this.shaders.cubemap_convolve,
            uniforms: {
                specularity: 2.0
            },
            samplers: {
                source: this.level3.result
            }
        });
    
        this.blit_processor = new glee.Processor({
            shader: this.shaders.cube_pass,
            fbo: params.fbo,
            result: params.display_result, 
            uniforms: {
                inv_view_rot: params.view.inv_rot,
                inv_proj: params.proj.inverse,
            },
            samplers: {
                source: this.display.result,
                //source: this.diffuse_sun.result,
            },
        });
        
        this.parameters = $('<div><h1>Sky</h1></div>');

        slider({
            title: 'Elevation',
            min: 0,
            max: 130,
            value: 60,
            step: 0.1,
            slide: function(value){
                self.elevation = value;
                self.render();
            }
        }).appendTo(this.parameters);
        
        slider({
            title: 'Orientation',
            min: 0,
            max: 360,
            value: 20,
            step: 0.1,
            slide: function(value){
                self.orientation = value;
                self.render();
            }
        }).appendTo(this.parameters);
       
        slider({
            title: 'Specularity',
            min: 0,
            max: 50,
            value: 5,
            step: 0.1,
            slide: function(value){
                self.specular_sun.uniforms.specularity = value;
                self.specular_env.uniforms.specularity = value;
                self.render();
            }
        }).appendTo(this.parameters);
    },
    render: function(){
        this.lightMat.ident().rotatex(this.elevation+90).rotatey(this.orientation);
        this.lightdir.set(0, 0, 1).mul(this.lightMat);

        $.each(this.settings, function(name, value){
            sky.display.uniforms[name] = value;
            sky.irradiance_sun.uniforms[name] = value;
            sky.irradiance_env.uniforms[name] = value;
        });
        sky.irradiance_env.uniforms.spot_brightness = 0;

        this.display.render();
        this.irradiance_sun.render();
        this.level1.samplers.source = this.irradiance_sun.result;
        this.level1.render();
        this.level2.render();
        this.level3.render();
        this.diffuse_sun.render();
        this.specular_sun.render();
        
        this.irradiance_env.render();
        this.level1.samplers.source = this.irradiance_env.result;
        this.level1.render();
        this.level2.render();
        this.level3.render();
        this.diffuse_env.render();
        this.specular_env.render();
        if(this.shadow){
            this.shadow.render();
        }
    },
    blit: function(){
        this.blit_processor.render();
    }
};
