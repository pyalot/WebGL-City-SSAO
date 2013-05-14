/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;

    var Shader = glee.Shader = function(source, path, shaders){
        var self = this;
        this.path = path;
        this.last_unit = 0;

        if(source){
            var shaders = this.preprocess(source);
        }
        
        this.create();
        this.fragment.source = shaders.fragment;
        this.vertex.source = shaders.vertex;
        this.compile();
    };
    Shader.prototype = {
        create: function(){
            this.fragment = gl.createShader(gl.FRAGMENT_SHADER);
            this.vertex = gl.createShader(gl.VERTEX_SHADER);
            this.program = gl.createProgram();
            gl.attachShader(this.program, this.vertex);
            gl.attachShader(this.program, this.fragment);
        },
        compile: function(params){
            this.uniform_cache = {};
            this.attrib_cache = {};
            var params = params || {};
            var directives = [
                '#version 100',
                'precision highp int;',
                'precision highp float;',
            ];

            for(i in (params.defines || [])){
                directives.push('#define ' + params.defines[i]);
            }
            directives = directives.join('\n') + '\n';

            var shaders = [this.fragment, this.vertex];
            for(i in shaders){
                var shader = shaders[i];
                var source = shader.source;
                for(name in params.values || {}){
                    var re = new RegExp('#define ' + name + ' \\w+', 'm');
                    source = source.replace(re, '#define ' + name + ' ' + params.values[name]);
                }
                gl.shaderSource(shader, directives + source);
                gl.compileShader(shader);
                if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
                    glee.handleError({
                        type: 'shader compile',
                        error: gl.getShaderInfoLog(shader),
                        path: this.path,
                    });
                }
            }
            gl.linkProgram(this.program);
            if(!gl.getProgramParameter(this.program, gl.LINK_STATUS)){
                glee.handleError({
                    type: 'program link',
                    error: gl.getProgramInfoLog(this.program),
                    path: this.path,
                });
            }
        },
        copy: function(){
            return new Shader(null, this.path, {
                vertex: this.vertex.source,
                fragment: this.fragment.source,
            });
        },
        preprocess: function(source){
            lines = source.split('\n');
            var shaders = {};
            var current;

            Glee.each(lines, function(i, line){
                var type = line.match(/^(\w+):/);
                if(type){
                    type = type[1];
                    current = shaders[type];
                    if(!current){
                        current = shaders[type] = [];
                    }
                }
                else{
                    if(current){
                        current.push({line: i, text: line});
                    }
                }
            });
            Glee.each(shaders, function(type, lines){
                var shader_source = '';
                $.each(lines, function(i, line){
                    shader_source += '#line ' + line.line + '\n' + line.text + '\n';
                });
                shaders[type] = shader_source;
            });
            return shaders;
        },
        unbind: function(){
            Shader.current = null;
            gl.useProgram(null);
        },
        bind: function(){
            Shader.current = this;
            gl.useProgram(this.program);
        },
        getAttribLocation: function(name){
            var attrib_location = this.attrib_cache[name];
            if(attrib_location === undefined){
                var attrib_location = this.attrib_cache[name] = gl.getAttribLocation(this.program, name);
            }
            return attrib_location;
        },
        getUniformLocation: function(name){
            var uniform_location = this.uniform_cache[name];
            if(uniform_location === undefined){
                var uniform_location = this.uniform_cache[name] = gl.getUniformLocation(this.program, name);
            }
            return uniform_location;
        },
        sampler: function(name, unit){
            var uniform_location = this.getUniformLocation(name);
            if(uniform_location){
                var pushed = this.push();
                gl.uniform1i(uniform_location, unit);
                this.pop(pushed);
            }
            return this;
        },
        uniform: function(name, value){
            var uniform_location = this.getUniformLocation(name);
            if(uniform_location){
                if(value === undefined){
                    return gl.getUniform(this.program, uniform_location);
                }
                else{
                    var pushed = this.push();
                    if(value.type == 'Mat4'){
                        gl.uniformMatrix4fv(uniform_location, false, value.data);
                    }
                    else if(value.type == 'Mat3'){
                        gl.uniformMatrix3fv(uniform_location, false, value.data);
                    }
                    else if(value.type == 'Vec3'){
                        gl.uniform3f(uniform_location, value.x, value.y, value.z);
                    }
                    else if(typeof(value) == 'number'){
                        gl.uniform1f(uniform_location, value);
                    }
                    else if(typeof(value) == 'object'){
                        gl['uniform' + value.length + 'fv'](uniform_location, value);
                    }
                    this.pop(pushed);
                }
            }
            return this;
        },
        uniform2f: function(name, x, y){
            var uniform_location = this.getUniformLocation(name);
            if(uniform_location){
                var pushed = this.push();
                gl.uniform2f(uniform_location, x, y);
                this.pop(pushed);
            }
            return this;
        },
        uniform3fv: function(name, value){
            var uniform_location = this.getUniformLocation(name);
            if(uniform_location){
                var pushed = this.push();
                gl.uniform3fv(uniform_location, value);
                this.pop(pushed);
            }
            return this;
        },
        push: function(){
            if(Shader.current == this){
                return false;
            }
            else{
                Shader.stack.push(this);
                this.bind();
                return true;
            }
        },
        pop: function(pushed){
            if(pushed){
                var previous = Shader.stack.pop();
                if(previous){
                    Shader.current = previous;
                    previous.bind();
                }
                else{
                    this.unbind();
                }
            }
        },
        binding: function(body){
            var pushed = this.push();
            body();
            this.pop(pushed);
        }
    }
    Shader.current = null;
    Shader.stack = [];
});
