/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;
    glee.checkError = function(description){
        var code = gl.getError();
        switch(code){
            case gl.NO_ERROR:
                return;
            case gl.OUT_OF_MEMORY:
                throw 'Out of Memory: ' + description
            case gl.INVALID_ENUM:
                throw 'Invalid Enum: ' + description
            case gl.INVALID_OPERATION:
                throw 'Invalid Operation: ' + description
            case gl.INVALID_FRAMEBUFFER_OPERATION:
                throw 'Invalid Framebuffer Operation: ' + description
            case gl.INVALID_VALUE:
                throw 'Invalid Value: ' + description
        }
    }
});

