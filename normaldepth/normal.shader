/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
vertex:
    attribute vec3 position, normal;
    varying vec3 v_normal, v_position;
    uniform mat4 proj, view;

    void main(void) {
        gl_Position = proj * view * vec4(position, 1.0);
        v_normal = normal;
        v_position = position;
    }

fragment:
    varying vec3 v_normal, v_position;
    uniform mat3 view_rot;
    uniform mat4 view;
    uniform float near, far;

    void main(void){
        vec3 normal = normalize(v_normal);
        gl_FragColor = vec4((normal+1.0)*0.5, 1.0);
    }
