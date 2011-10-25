/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;

    var FBO = glee.FBO = function(){
        this.id = gl.createFramebuffer();
    };

    var current = null;
    var stack = [];

    FBO.prototype = {
        check: function(){
            var result = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
            if(result == gl.FRAMEBUFFER_UNSUPPORTED){
                throw 'Framebuffer is unsupported';
            }
            else if(result == gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT){
                throw 'Framebuffer incomplete attachment';
            }
            else if(result == gl.FRAMEBUFFER_INCOMPLETE_DIMESIONS){
                throw 'Framebuffer incomplete dimensions';
            }
            else if(result == gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT){
                throw 'Framebuffer incomplete missing attachment';
            }
        },
        bind: function(){
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.id);
            current = this;
        },
        unbind: function(){
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            current = null;
        },
        push: function(){
            if(current == this){
                return false;
            }
            else{
                stack.push(current);
                this.bind();
                return true;
            }
        },
        pop: function(pushed){
            if(pushed){
                current = stack.pop();
                if(current){
                    current.bind();
                }
                else{
                    this.unbind();
                }
            }
        },
        color: function(attachment){
            var pushed = this.push();
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, attachment.target, attachment.id, 0)
            this.pop(pushed);
        },
        cubemap: function(id, target){
            var pushed = this.push();
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, target, id, 0)
            this.pop(pushed);
        },
        depth: function(attachment){
            var pushed = this.push();
            if(attachment){
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, attachment.id);
            }
            else{
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, null);
            }
            this.pop(pushed);
        },
        stencil: function(attachment){
            var pushed = this.push();
            if(attachment){
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, attachment.id);
            }
            else{
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.RENDERBUFFER, null);
            }
            this.pop(pushed);
        },
        depthstencil: function(attachment){
            var pushed = this.push();
            if(attachment){
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, attachment.id);
            }
            else{
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, null);
            }
            this.pop(pushed);
        }
    };
});
