/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;

    var IndicesBuffer = function(params){
        var buffer = gl.createBuffer();

        this.setData = function(params){
            var args = Glee.defaults(params, {mode:gl.STATIC_DRAW});
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, args.data, args.mode);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
        
        this.bind = function(){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        }

        if(params.data){
            this.setData(params);
        }
    }
    
    IndicesBuffer.unbind = function(){
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    var Buffer = function(params){
        var buffer = gl.createBuffer();

        this.setData = function(params){
            var args = Glee.defaults(params, {mode:gl.STATIC_DRAW});
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, args.data, args.mode);
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }

        this.bind = function(){
            var attrib_location = glee.Shader.current.getAttribLocation(params.name);
            if(attrib_location != -1){
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.enableVertexAttribArray(attrib_location);
                gl.vertexAttribPointer(attrib_location, params.size, params.type, false, 0, 0);
            }
        }

        if(params.data){
            this.setData(params);
        }
    };
        
    Buffer.unbind = function(){
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
        
    var buffer_types = {
        'f': {
            store: Float32Array,
            type: gl.FLOAT
        },
        'i': {
            store: Int32Array,
            type: gl.INT
        },
        's': {
            store: Uint16Array,
            type: gl.UNSIGNED_SHORT
        },
    }

    var stack = [];
    var current = null;

    glee.VBO = function(params){
        var buffers = [];
        var have_indices = false;

        for(spec in params){
            var data = params[spec];
            if(spec == 'indices'){
                have_indices = true;
                buffers.push(new IndicesBuffer({
                    data: new Uint16Array(data),
                    type: gl.UNSIGNED_SHORT,
                }));
                this.count = data.length;
            }
            else{
                var spec = spec.split(/_(?=[123]f)/);
                var name = spec[0];
                var typespec = spec[1];
                var size = Number(typespec.charAt(0));
                var type = buffer_types[typespec.charAt(1)];
                buffers.push(new Buffer({
                    name: name,
                    type: type.type,
                    size: size,
                    data: new type.store(data)
                }));
                if(!this.count){
                    this.count = data.length/size;
                }
            }
        }

        this.bind = function(){
            var l = buffers.length;
            for(var i=0; i<l; i++){
                buffers[i].bind();
            }
            current = this;
        }

        this.push = function(){
            if(current == this){
                return false;
            }
            else{
                if(current){
                    current.unbind();
                }
                stack.push(current);
                this.bind();
                return true;
            }
        }

        this.pop = function(pushed){
            if(pushed){
                this.unbind();
                current = stack.pop();
                if(current){
                    current.bind();
                }
            }
        }

        if(have_indices){
            this.unbind = function(){
                IndicesBuffer.unbind();
                Buffer.unbind();
            }
            this.draw = function(mode, count, offset){
                var pushed = this.push();
                gl.drawElements(mode || gl.TRIANGLES, count || this.count, gl.UNSIGNED_SHORT, offset || 0);
                this.pop(pushed);
            }
        }
        else{
            this.unbind = function(){
                Buffer.unbind();
            }
            this.draw = function(mode, count, offset){
                var pushed = this.push();
                gl.drawArrays(mode || gl.TRIANGLES, offset || 0, count || this.count);
                this.pop(pushed);
            }
        }
    };
});
