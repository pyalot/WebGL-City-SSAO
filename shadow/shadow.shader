/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
vertex:
    attribute vec3 position, normal;
    attribute vec2 texcoord;
    varying vec3 v_position;
    uniform mat4 proj, view;

    void main(void) {
        gl_Position = proj * view * vec4(position, 1.0);
        v_position = (view * vec4(position, 1.0)).xyz;
    }

fragment:
    uniform float near, far;
    varying vec3 v_position;
   
    vec4 pack(){
        float depth = (v_position.z - near)/(far-near);
        float depth1 = depth*255.0*255.0;
        float depth2 = (depth*depth)*255.0*255.0;
        return vec4(
            mod(depth1, 255.0)/255.0,
            floor(depth1/255.0)/255.0,
            mod(depth2, 255.0)/255.0,
            floor(depth2/255.0)/255.0
        );
    }

    void main(void){
        gl_FragColor = pack();
    }
