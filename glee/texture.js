/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;

    var Texture = glee.Texture = function(params){
        var args = Glee.defaults(params, {
            target: gl.TEXTURE_2D,
            format: gl.RGBA,
            internal_format: gl.RGBA,
            type: gl.UNSIGNED_BYTE,
            filter: gl.LINEAR,
        });

        this.id = gl.createTexture();
        this.target = args.target;
        this.format = args.format;
        this.internal_format = args.internal_format;
        this.type = args.type;

        if(args.repeat){
            var clamp = gl.REPEAT;
        }
        else{
            var clamp = gl.CLAMP_TO_EDGE;
        }

        if(args.image){
            this.width = args.image.width;
            this.height = args.image.height;

            this
                .bind()
                .imagedata(args.image)
                .param(gl.TEXTURE_MAG_FILTER, args.filter)
                .param(gl.TEXTURE_MIN_FILTER, args.filter)
                .param(gl.TEXTURE_WRAP_S, clamp)
                .param(gl.TEXTURE_WRAP_T, clamp)
                .unbind();
        }
        else{
            this.width = args.width || glee.width;
            this.height = args.height || glee.height;

            this
                .bind()
                .data(this.width, this.height, args.data)
                .param(gl.TEXTURE_MAG_FILTER, args.filter)
                .param(gl.TEXTURE_MIN_FILTER, args.filter)
                .param(gl.TEXTURE_WRAP_S, clamp)
                .param(gl.TEXTURE_WRAP_T, clamp)
                .unbind();
        }
    };

    Texture.prototype = {
        update: function(params){
            var args = Glee.defaults(params, {
                target: gl.TEXTURE_2D,
                format: gl.RGBA,
                internal_format: gl.RGBA,
                type: gl.UNSIGNED_BYTE,
                filter: gl.LINEAR,
            });

            this.width = args.width || glee.width;
            this.height = args.height || glee.height;
        
            if(args.repeat){
                var clamp = gl.REPEAT;
            }
            else{
                var clamp = gl.CLAMP_TO_EDGE;
            }
        
            this
                .bind()
                .data(this.width, this.height, args.data)
                .param(gl.TEXTURE_MAG_FILTER, args.filter)
                .param(gl.TEXTURE_MIN_FILTER, args.filter)
                .param(gl.TEXTURE_WRAP_S, clamp)
                .param(gl.TEXTURE_WRAP_T, clamp)
                .unbind();
        },
        data: function(width, height, data){
            if(!data){
                var data = null;
            }
            gl.texImage2D(this.target, 0, this.internal_format, width, height, 0, this.format, this.type, data);
            return this;
        },
        imagedata: function(image){
            gl.texImage2D(this.target, 0, this.internal_format, this.format, this.type, image);
            return this;
        },
        bind: function(unit){
            if(unit != undefined){
                gl.activeTexture(gl.TEXTURE0+unit);
            }
            gl.bindTexture(this.target, this.id);
            return this;
        },
        unbind: function(){
            gl.bindTexture(this.target, null);
            return this;
        },
        param: function(name, value){
            gl.texParameteri(this.target, name, value);
            return this;
        },
        repeat: function(){
            return this
                .bind()
                .param(gl.TEXTURE_WRAP_S, gl.REPEAT)
                .param(gl.TEXTURE_WRAP_T, gl.REPEAT)
                .unbind()
        },
        mipmap: function(){
            this
                .bind()
                .param(gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
                .param(gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.generateMipmap(gl.TEXTURE_2D);
            glee.checkError();
            this.unbind();
            return this;
        }
    };
});
