Glee.extensions.push(function(glee){
    glee.Viewpoint = function(params){
        if(params){
            var keys = params.keys;
        }
        else{
            var keys = null;
        }

        var speed_factor = params.speed || 0.05;
        var change_factor = 80.0;
        var speed_damping = params.damping || 0.9;

        this.matrix = new glee.Mat4();
        this.rot = new glee.Mat3();
        this.inv = new glee.Mat4();
        this.inv_rot = new glee.Mat3();

        var mousepressed = false;
        var x, y;

        if(params.position){
            var position = params.position;
        }
        else{
            var position = this.position = new glee.Vec3(0.0, 0.0, 0.0);
        }

        if(params.offset){
            var offset = params.offset;
        }
        else{
            var offset = new glee.Vec3(0.0, 0.0, 0.0);
        }

        var speed = this.speed = new glee.Vec3();
        var change = this.speed = new glee.Vec3();

        var rotation = this.rotation = new glee.Vec3();
        var rotspeed = new glee.Vec3();
        var tmp = new glee.Vec3();

        var elem = glee.canvas;

        $(elem).mousedown(function(event){
            if(event.button == 0){
                x = event.pageX, y = event.pageY;
                mousepressed = true;
            }
            return false;
        });

        $(elem).mouseup(function(event){
            if(event.button == 0){
                mousepressed = false;
            }
        });

        $(elem).mousemove(function(event){
            if(mousepressed){
                var xdelta = event.pageX-x;
                var ydelta = y-event.pageY;
                x = event.pageX, y = event.pageY;
                rotspeed.x -= xdelta*2.0;
                rotspeed.y -= ydelta*2.0;
            }
        });
                
        this.step = function(delta){
            tmp.update(rotspeed).mul(delta);
            rotation.add(tmp);
            rotspeed.mul(0.93);
            
            tmp.update(speed).mul(speed_factor*delta);
            position.add(tmp);
            speed.mul(speed_damping);

            if(keys){
                change.x = keys.a ? -1 : keys.d ? +1 : 0;
                change.y = keys.q ? -1 : keys.e ? +1 : 0;
                change.z = keys.s ? +1 : keys.w ? -1 : 0;
            }

            change.mul(change_factor*delta).mul(this.rot);
            speed.add(change);

            if(rotation.y > 70){
                rotation.y = 70;
                rotspeed.y = 0;
            }
            else if(rotation.y < -70){
                rotation.y = -70;
                rotspeed.y = 0;
            }
            
            this.matrix.ident()
                .translate(-offset.x, -offset.y, -offset.z)
                .rotatex(this.rotation.y)
                .rotatey(-this.rotation.x)
                .translate(-position.x, -position.y, -position.z)
            this.rot.updateFrom(this.matrix);
            this.inv.updateFrom(this.matrix).invert();
            this.inv_rot.updateFrom(this.inv);
        }
    };
});
