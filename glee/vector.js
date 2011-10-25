/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
(function(){
    var fmt = function(value){
        var str = value.toFixed(4);
        while(str.length < 7){
            str = ' ' + str;
        }
        return str;
    }

    var Vec3 = Glee.prototype.Vec3 = function(x, y, z){
        this.x = x === undefined ? 0 : x
        this.y = y === undefined ? 0 : y
        this.z = z === undefined ? 0 : z
    };

    Vec3.prototype = {
        type: 'Vec3',
        normalize: function(){
            var length = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
            if(length != 0){
                this.x /= length;
                this.y /= length;
                this.z /= length;
            }
            return this;
        },
        log: function(message){
            if(!message){
                var message = 'Vec3';
            }
            console.log('%s: %s %s %s', message, fmt(this.x), fmt(this.y), fmt(this.z));
            return this;
        },
        mul: function(value){
            if(value.type == 'Vec3'){
                this.x *= value.x;
                this.y *= value.y;
                this.z *= value.z;
            }
            else if(value.type == 'Mat3'){
                this.set(
                    value.data[0]*this.x + value.data[1]*this.y + value.data[2]*this.z,
                    value.data[3]*this.x + value.data[4]*this.y + value.data[5]*this.z,
                    value.data[6]*this.x + value.data[7]*this.y + value.data[8]*this.z
                )
            }
            else{
                this.x *= value;
                this.y *= value;
                this.z *= value;
            }
            return this;
        },
        sub: function(value){
            if(value.type == 'Vec3'){
                this.x -= value.x;
                this.y -= value.y;
                this.z -= value.z;
            }
            else{
                this.x -= value;
                this.y -= value;
                this.z -= value;
            }
            return this;
        },
        add: function(value){
            if(value.type == 'Vec3'){
                this.x += value.x;
                this.y += value.y;
                this.z += value.z;
            }
            else{
                this.x += value;
                this.y += value;
                this.z += value;
            }
            return this;
        },
        update: function(other){
            this.x = other.x;
            this.y = other.y;
            this.z = other.z;
            return this;
        },
        set: function(x, y, z){
            this.x = x;
            this.y = y;
            this.z = z;
            return this;
        }
    };
})();
