/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
Glee.extensions.push(function(glee){
    glee.Cube = function(size){
        var s = size || 1;
        var vbo = this.vbo = new glee.VBO({
            position_3f: [
                // front
                -s, -s, -s,    -s,  s, -s,    s,  s, -s,
                 s, -s, -s,    -s, -s, -s,    s,  s, -s,
                                                        
                // back
                 s,  s,  s,    -s,  s,  s,   -s, -s,  s,
                 s,  s,  s,    -s, -s,  s,    s, -s,  s,
                                                        
                // top
                -s,  s, -s,    -s,  s,  s,    s,  s,  s,
                 s,  s, -s,    -s,  s, -s,    s,  s,  s,
                                                        
                // bottom
                 s, -s,  s,    -s, -s,  s,   -s, -s, -s,
                 s, -s,  s,    -s, -s, -s,    s, -s, -s,
                                             
                 // left
                 -s, -s, -s,   -s, -s,  s,   -s,  s,  s,
                 -s,  s, -s,   -s, -s, -s,   -s,  s,  s,
                                             
                 // right
                  s,  s,  s,    s, -s,  s,    s, -s, -s,
                  s,  s,  s,    s, -s, -s,    s,  s, -s
            ],
            normal_3f: [
                // front
                 0,  0, -1,   0,  0, -1,   0,  0, -1,
                 0,  0, -1,   0,  0, -1,   0,  0, -1,
                                          
                // back
                 0,  0,  1,   0,  0,  1,   0,  0,  1,
                 0,  0,  1,   0,  0,  1,   0,  0,  1,
                                                     
                // top
                 0,  1,  0,   0,  1,  0,   0,  1,  0,
                 0,  1,  0,   0,  1,  0,   0,  1,  0,
                                          
                // bottom
                 0, -1,  0,   0, -1,  0,   0, -1,  0,
                 0, -1,  0,   0, -1,  0,   0, -1,  0,
                                          
                // left
                -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
                -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
                                          
                // right
                 1,  0,  0,   1,  0,  0,   1,  0,  0,
                 1,  0,  0,   1,  0,  0,   1,  0,  0
            ],
            texcoord_2f: [
                0, 1,  0, 0,  1, 0,  
                1, 1,  0, 1,  1, 0,  
                              
                1, 0,  0, 0,  0, 1,  
                1, 0,  0, 1,  1, 1,  
                              
                0, 1,  0, 0,  1, 0,  
                1, 1,  0, 1,  1, 0,  
                              
                1, 0,  0, 0,  0, 1,  
                1, 0,  0, 1,  1, 1,  
                              
                0, 1,  0, 0,  1, 0,  
                1, 1,  0, 1,  1, 0,  
                              
                1, 0,  0, 0,  0, 1,  
                1, 0,  0, 1,  1, 1
            ]
        });

        this.draw = function(){
            vbo.draw(glee.gl.TRIANGLES); 
        }
    }
});
