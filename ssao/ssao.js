var random_id = function(){
    var result = '';
    var chars = 'abcdefghijklmnopqrstuvwxyz';
    for(var i=0; i<32; i++){
        result += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return result;
}

ssao = {
    root: 'ssao',
    shaders: {
        gpg8: 'gpg8.shader',
        gd: 'gd.shader',
        gp1: 'gp1.shader',
    },
    SSAO: function(glee, klass, params){
        var self = this;
        this.enabler = params.enabler;
    
        var width = 16;
        var height = 16;

        var create_field_data = function(){
            var data = [];
            while(data.length < width*height*4){
                var x = (Math.random()-0.5)*2.0;
                var y = (Math.random()-0.5)*2.0;
                var z = (Math.random()-0.5)*2.0;
                var l = Math.sqrt(x*x+y*y+z*z);
                if(l <= 1.0 && l > 0.1){
                    x = (x+1.0)*0.5;
                    y = (y+1.0)*0.5;
                    z = (z+1.0)*0.5;
                    data.push(x*255, y*255, z*255, 255);
                }
            }
            return new Uint8Array(data);
        }
    
        var random_field = new glee.Texture({
            width: width,
            height: height,
            filter: glee.gl.NEAREST,
            repeat: true,
            data: create_field_data(),
        });

        var result = this.result = new glee.Texture({
            width: glee.width,
            height: glee.height,
        });
        
        var variant = function(args){
            var processor = new glee.Processor({
                fbo: params.fbo,
                result: result,
                shader: args.shader.copy(),
                samplers: {
                    normaldepth: params.normaldepth.result,
                    normalmap: params.normaldepth.normal,
                    random_field: random_field,
                    scene: params.scene.result,
                    environment: params.sky.specular_sun.result,
                },
                uniforms: {
                    near: params.proj.near,
                    far: params.proj.far,
                    proj: params.proj.matrix,
                    rot: params.view.rot,
                    inv_proj: params.proj.inverse,
                    inv_rot: params.view.inv_rot,
                    lightdir: params.sky.lightdir,
                },
            });
            var properties = $('<div></div>');

            var defines = [];
            if(args.defines){
                var row = $('<div class="field"></div>').appendTo(properties);
                $.each(args.defines, function(name, display){
                    var id = random_id();
                    $('<input type="checkbox">')
                        .attr('id', id)
                        .val(name)
                        .appendTo(row);
                    $('<label></label>')
                        .attr('for', id)
                        .text(display)
                        .appendTo(row);
                });
                row.buttonset().find('input').change(function(){
                    defines = [];
                    row.find('input:checked').each(function(i, item){
                        defines.push($(item).val());
                    });
                    processor.shader.compile({
                        defines: defines,
                        values: values
                    });
                });
            }

            $.each(args.uniforms, function(name, data){
                var row = $('<div class="field"></div>').appendTo(properties);
                if(data.range){
                    processor.uniforms[data.uniform1] = data.values[0];
                    processor.uniforms[data.uniform2] = data.values[1];
                }
                else{
                    processor.uniforms[name] = data.value;
                }
                $('<label class="desc"></label>').appendTo(row).text(data.name);
                $('<div class="hslider"></div>').slider({
                    range: data.range,
                    min: data.min,
                    max: data.max,
                    value: data.value,
                    values: data.values,
                    step: data.step,
                    slide: function(event, ui){
                        if(data.range){
                            processor.uniforms[data.uniform1] = ui.values[0];
                            processor.uniforms[data.uniform2] = ui.values[1];
                            value_display.text(ui.values[0] + ' - ' + ui.values[1]);
                        }
                        else{
                            processor.uniforms[name] = ui.value;
                            value_display.text(ui.value);
                        }
                    }
                }).appendTo(row);
                if(data.range){
                    var value_display = $('<span></span>').appendTo(row).text(data.values[0] + ' - ' + data.values[1]);
                }
                else{
                    var value_display = $('<span></span>').appendTo(row).text(data.value);
                }
            });
            
            var values = {};
            if(args.values){
                $.each(args.values, function(name, data){
                    var row = $('<div class="field"></div>').appendTo(properties);
                    $('<label class="desc"></label>').appendTo(row).text(data.name);
                    var buttons = $('<span></span>').appendTo(row);;
                    if(data.options){
                        var check_name = random_id();
                        $.each(data.options, function(i, value){
                            var id = random_id();
                            $('<input type="radio">')
                                .attr('value', value)
                                .attr('name', check_name)
                                .attr('id', id)
                                .attr('checked', value==data.value)
                                .appendTo(buttons);
                            $('<label></label>')
                                .css('font-size', 10)
                                .attr('for', id)
                                .text(value)
                                .appendTo(buttons);
                        });
                        buttons.buttonset().find('input').change(function(){
                            var value = new Number($(this).val());
                            values[name] = value;
                            if(data.change){
                                data.change(value);
                            }
                            processor.shader.compile({
                                defines: defines,
                                values: values
                            });
                        });
                    }
                    values[name] = data.value;
                });
            }
        
            return {
                processor: processor,
                properties: properties,
            }
        }
                    
        var sample_count = {
            name: 'Samples',
            value: 16,
            options: [1, 2, 4, 8, 16, 32, 64],
            change: function(value){
                width = value;
                random_field.update({
                    width: width,
                    height: height,
                    filter: glee.gl.NEAREST,
                    repeat: true,
                    data: create_field_data(),
                });
            },
        };
        var pattern_size = {
            name: 'Pattern',
            value: 4,
            options: [1, 2, 4, 8, 16],
            change: function(value){
                height = value*value;
                random_field.update({
                    width: width,
                    height: height,
                    filter: glee.gl.NEAREST,
                    repeat: true,
                    data: create_field_data(),
                });
            },
        };

        var variants = {
            gpg8: variant({
                shader: klass.shaders.gpg8,
                uniforms: {
                    occlusion_power: { 
                        name: 'Power',
                        min: 0,
                        max: 10.0,
                        value: 2.0,
                        step: 0.1,
                    },
                    epsilon: {
                        name: 'Epsilon',
                        min: 0,
                        max: 0.1,
                        value: 0.001,
                        step: 0.001,
                    },
                    power: {
                        name: 'Power',
                        min: 0,
                        max: 5.0,
                        value: 1.00,
                        step: 0.001,
                    },
                    radius: {
                        name: 'Radius',
                        min: 0,
                        max: 1.5,
                        value: 0.2,
                        step: 0.01,
                    },
                    tresholds: {
                        name: 'Tresholds',
                        range: true,
                        uniform1: 'full_occlusion_treshold',
                        uniform2: 'no_occlusion_treshold',
                        min: 0,
                        max: 1.0,
                        values: [0.1, 0.3],
                        step: 0.01,
                    },
                },
                values: {
                    sample_count: sample_count,
                    pattern_size: pattern_size,
                },
            }),
            gd: variant({
                shader: klass.shaders.gd,
                uniforms: {
                    radius: {
                        name: 'Radius',
                        min: 0,
                        max: 1.5,
                        value: 0.2,
                        step: 0.01,
                    },
                    occlusion_factor: {
                        name: 'Factor',
                        min: 0.1,
                        max: 10,
                        value: 1.0,
                        step: 0.1,
                    },
                    occlusion_power: {
                        name: 'Power',
                        min: 0,
                        max: 10,
                        value: 1.0,
                        step: 0.1,
                    },
                    dist_factor: {
                        name: 'Dist Fac.',
                        min: 0.01,
                        max: 10.0,
                        value: 1.0,
                        step: 0.01,
                    },
                    dist_power: {
                        name: 'Dist Pow.',
                        min: 0,
                        max: 10,
                        value: 2.0,
                        step: 0.1,
                    }
                },
                values: {
                    sample_count: sample_count,
                    pattern_size: pattern_size,
                },
                defines: {
                    sample_rotate: 'Rotate',
                }
            }),
            gp1: variant({
                shader: klass.shaders.gp1,
                uniforms: {
                    radius: {
                        name: 'Radius',
                        min: 0,
                        max: 1.5,
                        value: 0.2,
                        step: 0.01,
                    },
                    singularity: {
                        name: 'Singularity',
                        min: 0,
                        max: 1.5,
                        value: 0.2,
                        step: 0.01,
                    },
                    strength: {
                        name: 'Strength',
                        min: 0.1,
                        max: 10,
                        value: 1.0,
                        step: 0.1,
                    },
                    depth_bias: {
                        name: 'Depth Bias',
                        min: -0.2,
                        max: 0.2,
                        value: 0.0,
                        step: 0.01,
                    },
                },
                values: {
                    sample_count: sample_count,
                    pattern_size: pattern_size,
                },
                defines: {
                    sample_rotate: 'Rotate',
                }
            }),
        };

        var name = params.name.replace(' ', '-');

        this.parameters = $('<div></div>');
        $('<h1></h1>').text(params.name).appendTo(this.parameters);
        var selection = $('<div></div>').appendTo(this.parameters);
        $.each(['gd', 'gpg8', 'gp1'], function(i, variant_name){
            var btn = $('<input type="radio">')
                .attr('value', variant_name)
                .attr('name', 'variant-' + name)
                .attr('id', 'variant-' + variant_name + name)
                .appendTo(selection);
            $('<label></label')
                .text(variant_name)
                .attr('for', 'variant-' + variant_name + name)
                .appendTo(selection);
            btn.button({label:variant_name});
        });
        selection.buttonset();
        selection.find('input').change(function(){
            self.active = variants[$(this).val()];
            properties.children().detach();
            properties.append(self.active.properties);
        });
        this.active = variants.gd;
        var properties = $('<div></div>').appendTo(this.parameters).append(this.active.properties);

        this.render = function(){
            this.active.processor.render();
        }
        
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
    }
}
