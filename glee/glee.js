/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/

glee_errors = ({
    'support': '<div>Your browser does not support webgl. Please try <a href="http://www.google.com/chrome">Google Chrome</a> or <a href="http://www.mozilla.com/en-US/firefox/new/">Firefox</a>. If you have Google Chrome on windows, try the option --use-gl=desktop.</div>',
    'ext': [
        '<div>Your browser lacks support for the required extension: %s</div>',
        '<ul>',
            '<li>Firefox does not support some extensions. You can try <a href="http://www.google.com/chrome">Google Chrome</a></li>',
            '<li>The Google Chrome ANGLE wrapper does not support extensions. You can try starting chrome with the option --use-gl=desktop</li>',
            '<li>Your graphics card may not support this extension</li>',
            '<li>Your driver may not support this extension. Try updating your driver or use othe proprietary driver from your graphics card vendor.</li>',
        '</ul>',
    ].join(''),
    'shader compile': '<div>A shader failed to compile.</div>',
    'program link': '<div>A shader program failed to link.</div>',
    'program validate': '<div>A shader program failed to validate.</div>'
});

var Glee = function(canvas, options){
    var glee = this;
    this.canvas = canvas;
    this.handleError = function(info){
        if(options && options.error){
            var description = glee_errors[info.type].replace('%s', info.error);
            options.error(glee, description, info);
        }
        else{
            console.log(info);
        }
        throw info;
    };
    try{
        var gl = this.gl = canvas.getContext('experimental-webgl', {
            stencil: true
        });
    }
    catch(error){
        if(options && options.capabilities){
            options.capabilities(glee, glee_errors.support, false);
        }
        throw glee_errors['support'];
    }
    if(!gl){
        if(options && options.capabilities){
            options.capabilities(glee, glee_errors.support, false);
        }
        throw glee_errors['support'];
    }
    
    this.get = function(name){
        return gl.getParameter(gl[name]);
    }

    if(options && options.capabilities){
        options.capabilities(glee, null, true);
    }

    //gl.enable(gl.CULL_FACE);
    //gl.cullFace(gl.BACK);

    for(i in Glee.extensions){
        var extension = Glee.extensions[i];
        extension(glee);
    }
   
    this.resize = function(width, height){
        this.width = width;
        this.height = height;
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        return this;
    }
    
    var clear = this.clear = function(params){
        if(typeof(params) == 'boolean'){
            var flags = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT;
            gl.clearColor(0, 0, 0, 1);
            gl.clearDepth(0);
            gl.clearStencil(0);
        }
        else if(typeof(params) == 'object'){
            var flags = 0;
            if(params.color){
                flags |= gl.COLOR_BUFFER_BIT;
                if(typeof(params.color) == 'boolean'){
                    gl.clearColor(0, 0, 0, 1);
                }
                else{
                    gl.clearColor.apply(gl, params.color);
                }
            }
            if(params.depth){
                flags |= gl.DEPTH_BUFFER_BIT;
                gl.clearDepth(params.depth);
            }
            if(params.stencil){
                flags |= gl.STENCIL_BUFFER_BIT;
                gl.clearStencil(params.stencil || 0);
            }
        }
        gl.clear(flags);
        return this;
    };

    this.enable = function(name){
        gl.enable(gl[name]);
    }

    this.enableStencil = function(){
        gl.enable(gl.STENCIL_TEST);
        return this;
    }
    this.disableStencil = function(){
        gl.disable(gl.STENCIL_TEST);
        return this;
    }
    
    this.stencilFunc = function(func, ref, mask){
        var func = func || gl.ALWAYS;
        var ref = ref || 0;
        var mask = mask || 255;
        gl.stencilFunc(func, ref, mask);
        return this;
    }

    this.stencilMask = function(mask){
        var mask = mask || 255;
        gl.stencilMask(mask);
    }

    this.stencilOp = function(fail, depth_fail, pass){
        var fail = fail || gl.KEEP;
        var depth_fail = depth_fail || gl.KEEP;
        var pass = pass || gl.KEEP;
        gl.stencilOp(fail, depth_fail, pass);
    }
  
    this.noDepth = function(){
        gl.disable(gl.DEPTH_TEST);
        return this;
    };

    this.depthLess = function(){
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        return this;
    }
    
    this.depthGreater = function(){
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.GREATER);
        return this;
    }

    this.noBlend = function(){
        gl.disable(gl.BLEND);
        return this;
    }

    this.blendAdditive = function(){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        return this;
    }

    this.blendMul = function(){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ZERO, gl.SRC_COLOR); // does not work
        //gl.blendFunc(gl.DST_COLOR, gl.ZERO); // does not work
        return this;
    }

    this.blendAlpha = function(){
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this.checkError();
        return this;
    }

    this.requireExt = function(name){
        if(!gl.getExtension('OES_' + name)){
            this.handleError({
                type: 'ext',
                error: 'OES_' + name,
            });
        }
        else{
            this[name] = true;
        }
        return this;
    }

    this.requestExt = function(name){
        if(gl.getExtension('OES_' + name)){
            this[name] = true;
        }
        return this;
    }

    this.Perspective = function(params){
        Glee.extend(this, params);
        this.matrix = new glee.Mat4().perspective(params);
        this.inverse = new glee.Mat4().inverse_perspective(params);
    }
    
    this.Ortho = function(params){
        Glee.extend(this, params);
        this.matrix = new glee.Mat4().ortho(params);
        this.inverse = new glee.Mat4().inverse_ortho(params);
    }
}

Glee.defaults = function(params, defaults){
    var result = {};
    for(name in defaults){
        result[name] = defaults[name];
    };
    for(name in params){
        result[name] = params[name];
    };
    return result;
}

Glee.extend = function(obj, other){
    for(name in other){
        obj[name] = other[name];
    }
}

Glee.each = function(collection, fun){
    for(index in collection){
        fun(index, collection[index]);
    };
};

Glee.extensions = [];
