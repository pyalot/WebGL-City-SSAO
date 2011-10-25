/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;

    var DepthBuffer = glee.DepthBuffer = function(params){
        this.format = gl.DEPTH_COMPONENT16;
        this.id = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.id);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.format, params.width, params.height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };
    
    var StencilBuffer = glee.StencilBuffer = function(params){
        this.format = gl.STENCIL_INDEX8;
        this.id = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.id);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.format, params.width, params.height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };
    
    var DepthStencilBuffer = glee.DepthStencilBuffer = function(params){
        this.format = gl.DEPTH_STENCIL;
        this.id = gl.createRenderbuffer();

        gl.bindRenderbuffer(gl.RENDERBUFFER, this.id);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.format, params.width, params.height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    };
});
