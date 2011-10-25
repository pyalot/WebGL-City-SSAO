/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    glee.Plane = function(params){
        var size = params.size;
        var scale = params.scale;
        var factor = (1.0/size)*scale;
        var half_scale = scale/2;

        var vertices = [];
        var texcoords = [];
        var normals = [];

        for(var x=0; x<size; x++){
            for(var z=0; z<size; z++){
                vertices.push((x+0)*factor-half_scale, 0, (z+0)*factor-half_scale);
                vertices.push((x+0)*factor-half_scale, 0, (z+1)*factor-half_scale);
                vertices.push((x+1)*factor-half_scale, 0, (z+1)*factor-half_scale);
                
                texcoords.push((x+0)/size, (z+0)/size);
                texcoords.push((x+0)/size, (z+1)/size);
                texcoords.push((x+1)/size, (z+1)/size);

                vertices.push((x+1)*factor-half_scale, 0, (z+0)*factor-half_scale);
                vertices.push((x+0)*factor-half_scale, 0, (z+0)*factor-half_scale);
                vertices.push((x+1)*factor-half_scale, 0, (z+1)*factor-half_scale);

                texcoords.push((x+1)/size, (z+0)/size);
                texcoords.push((x+0)/size, (z+0)/size);
                texcoords.push((x+1)/size, (z+1)/size);

                normals.push(
                    0,  1,  0,
                    0,  1,  0,
                    0,  1,  0,
                    0,  1,  0,
                    0,  1,  0,
                    0,  1,  0
                )
            }
        }

        this.size = vertices.length/3;

        var vbo = this.vbo = new glee.VBO({
            position_3f: vertices,
            normal_3f: normals,
            texcoord_2f: texcoords
        });

        this.draw = function(){
            vbo.draw(glee.gl.TRIANGLES, this.size); 
        }
    }
});
