/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var gl = glee.gl;

    var Cubemap = glee.Cubemap = function(params){
        this.id = gl.createTexture();
        this.target = gl.TEXTURE_CUBE_MAP;

        var filter = params.filter || gl.LINEAR;
        var type = params.type || gl.UNSIGNED_BYTE;

        this
            .bind()
            .init(params.width, params.height, type)
            .param(gl.TEXTURE_MAG_FILTER, filter)
            .param(gl.TEXTURE_MIN_FILTER, filter)
            .param(gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            .param(gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            .unbind();
    };

    Cubemap.prototype = {
        init: function(width, height, type){
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, width, height, 0, gl.RGBA, type, null);
            return this;
        },
        bind: function(unit){
            if(unit != undefined){
                gl.activeTexture(gl.TEXTURE0+unit);
            }
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.id);
            return this;
        },
        unbind: function(){
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
            return this;
        },
        param: function(name, value){
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, name, value);
            return this;
        },
    };

    var CubeProcessor = glee.CubeProcessor = function(params){
        var args = Glee.defaults(params, {near:1, far:100});
        Glee.extend(this, args);

        this.proj = new glee.Mat4()
            .perspective({
                width: this.width,
                height: this.height,
                fov: 90,
                near: this.near,
                far: this.far
            });

        if(!this.result){
            this.result = new Cubemap({
                type: this.type,
                width: this.width,
                height: this.height,
                filter: this.filter,
            });
        }
        
        this.inv_proj = new glee.Mat4()
            .inverse_perspective({
                width: this.width,
                height: this.height,
                fov: 90,
                near: this.near,
                far: this.far
            });

        this.view = new glee.Mat4();
        this.inv_view = new glee.Mat4();
        this.view_rot = new glee.Mat3();
        this.inv_view_rot = new glee.Mat3();
    };

    CubeProcessor.prototype = {
        render: function(){
            var unit = 0;
            if(this.samplers){
                for(name in this.samplers){
                    this.shader.sampler(name, unit);
                    this.samplers[name].bind(unit);
                    unit += 1;
                };
            }
            if(this.uniforms){
                for(name in this.uniforms){
                    this.shader.uniform(name, this.uniforms[name]);
                }
            }
            if(this.uniform3f){
                for(name in this.uniform3f){
                    this.shader.uniform3fv(name, this.uniform3f[name]);
                }
            }

            if(this.blend){
                glee['blend' + this.blend]();
            }
            else{
                glee.noBlend();
            }
            
            if(this.depth){
                if(this.depth.buffer){
                    this.fbo.depth(this.depth.buffer);
                }
                else{
                    this.fbo.depth(null);
                }

                if(this.depth.test){
                    glee['depth'+this.depth.test]();
                }
                else{
                    glee.noDepth();
                }

                if(this.depth.write){
                    gl.depthMask(true);
                }
                else{
                    gl.depthMask(false);
                }
            }
            else{
                this.fbo.depth(null);
                glee.noDepth();
                gl.depthMask(false);
            }

            var self = this;
            
            var stencil = this.stencil;
            if(stencil){
                if(stencil.test){
                    glee.enableStencil();
                }
                else{
                    glee.disableStencil();
                }

                if(stencil.buffer){
                    this.fbo.stencil(stencil.buffer);
                    this.fbo.check();
                }
                else{
                    this.fbo.stencil(null);
                }

                glee.stencilMask(stencil.mask);
                if(stencil.func){
                    glee.stencilFunc(stencil.func.test, stencil.func.ref, stencil.func.mask);
                }
                else{
                    glee.stencilFunc();
                }
                if(stencil.op){
                    glee.stencilOp(stencil.op.fail, stencil.op.depth_fail, stencil.op.pass);
                }
                else{
                    glee.stencilOp();
                }
            }
            else{
                this.fbo.stencil(null);
                glee.disableStencil();
            }
            this.fbo.depthstencil(this.depthstencil);

            var pushed = this.fbo.push();
                gl.viewport(0, 0, self.width, self.height);
                this.shader.binding(function(){
                    self.shader
                        .uniform('proj', self.proj)
                        .uniform('inv_proj', self.inv_proj)
                        .uniform2f('viewport', self.width, self.height);

                    self.view.ident().rotatex(180);
                    self.fbo.cubemap(self.result.id, gl.TEXTURE_CUBE_MAP_POSITIVE_Z);
                    self.do_draw();
                   
                    self.view.ident().rotatey(90).rotatex(180);
                    self.fbo.cubemap(self.result.id, gl.TEXTURE_CUBE_MAP_POSITIVE_X);
                    self.do_draw();
                    
                    self.view.ident().rotatex(90).rotatex(180);
                    self.fbo.cubemap(self.result.id, gl.TEXTURE_CUBE_MAP_POSITIVE_Y);
                    self.do_draw();
                    
                    self.view.ident().rotatey(180).rotatex(180);
                    self.fbo.cubemap(self.result.id, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z);
                    self.do_draw();
                   
                    self.view.ident().rotatex(-90).rotatex(180);
                    self.fbo.cubemap(self.result.id, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y);
                    self.do_draw();
                    
                    self.view.ident().rotatey(-90).rotatex(180);
                    self.fbo.cubemap(self.result.id, gl.TEXTURE_CUBE_MAP_NEGATIVE_X);
                    self.do_draw();
                });
            this.fbo.pop(pushed);
        },
        do_draw: function(){
            this.view_rot.updateFrom(this.view);
            this.inv_view.updateFrom(this.view).invert();
            this.inv_view_rot.updateFrom(this.inv_view);

            this.shader
                .uniform('view', this.view)
                .uniform('view_rot', this.view_rot)
                .uniform('inv_view', this.inv_view)
                .uniform('inv_view_rot', this.inv_view_rot)

            if(this.clear){
                glee.clear(this.clear);
            }
            
            if(this.draw){
                this.draw();
            }
            else{
                glee.fill_screen.draw();
            }
        }
    };
});
