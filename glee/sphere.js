/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    var phi = (1+Math.sqrt(5))/2;

    var v1 = [1, phi, 0];
    var v2 = [-1, phi, 0];
    var v3 = [0, 1, phi];
    var v4 = [0, 1, -phi];
    var v5 = [phi, 0, 1];
    var v6 = [-phi, 0, 1];
    var v7 = [-phi, 0, -1];
    var v8 = [phi, 0, -1];
    var v9 = [0, -1, phi];
    var v10 = [0, -1, -phi];
    var v11 = [-1, -phi, 0];
    var v12 = [1, -phi, 0];

    var faces = [
      [v1 , v2 , v3 ],  
      [v2 , v1 , v4 ],
      [v1 , v3 , v5 ],
      [v2 , v6 , v3 ],
      [v2 , v7 , v6 ],
      [v2 , v4 , v7 ],
      [v1 , v5 , v8 ],
      [v1 , v8 , v4 ],
      [v9 , v3 , v6 ],
      [v3 , v9 , v5 ],
      [v4 , v10, v7 ],
      [v4 , v8 , v10],
      [v6 , v7 , v11],
      [v6 , v11, v9 ],
      [v7 , v10, v11],
      [v5 , v12, v8 ],
      [v12, v5 , v9 ],
      [v12, v10, v8 ],
      [v11, v12, v9 ],
      [v12, v11, v10]
    ];

    var midp = function(v1, v2){
        var x1 = v1[0];
        var y1 = v1[1];
        var z1 = v1[2];
        
        var x2 = v2[0];
        var y2 = v2[1];
        var z2 = v2[2];
        
        var x3 = (x1+x2)/2;
        var y3 = (y1+y2)/2;
        var z3 = (z1+z2)/2;

        return [x3, y3, z3];
    }

    var subdivide = function(faces){
        var result = [];
        for(fi in faces){
            var face = faces[fi];
            var v0 = face[0];
            var v1 = face[1];
            var v2 = face[2];

            var va = midp(v0, v1);
            var vb = midp(v1, v2);
            var vc = midp(v2, v0);

            result.push(
                [v0, va, vc],
                [va, v1, vb],
                [vc, vb, v2],
                [va, vb, vc]
            )
        }
        return result;
    }

    var normalize = function(faces, r){
        if(r === undefined){
            var r = 1.0;
        }
        var result = [];
        for(fi in faces){
            var face = faces[fi];
            var new_face = [];
            result.push(new_face);
            for(vi in face){
                var vertex = face[vi];
                var x = vertex[0];
                var y = vertex[1];
                var z = vertex[2];
                var l = Math.sqrt(x*x + y*y + z*z);
                new_face.push([(r*x)/l, (r*y)/l, (r*z)/l]);
            }
        }
        return result;
    }

    var vertexlist = function(faces){
        var vertices = [];
        for(fi in faces){
            var face = faces[fi];
            for(vi in face){
                var vertex = face[vi];
                var x = vertex[0];
                var y = vertex[1];
                var z = vertex[2];
                vertices.push(x, y, z);
            }
        }
        return vertices;
    }

    var template = normalize(faces);
    var template = subdivide(template);
    var template = normalize(template);
    var template = subdivide(template);
    var template = normalize(template);
    var template = subdivide(template);
    var template = normalize(template);

    glee.Sphere = function(radius){
        var faces = normalize(template, radius);
        var vertices = vertexlist(faces);
        var normals = vertexlist(template);

        var vbo = this.vbo = new glee.VBO({
            position_3f: vertices,
            normal_3f: normals,
        });

        this.draw = function(){
            //vbo.draw(glee.gl.TRIANGLES, vertices.length/3); 
            vbo.draw(glee.gl.TRIANGLES, vertices.length/3); 
        }
    }
});
