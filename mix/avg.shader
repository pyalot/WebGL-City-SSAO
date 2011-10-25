/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
vertex:
    attribute vec3 position;
    attribute vec2 texcoord;
    varying vec2 uv;

    void main(void) {
        gl_Position = vec4(position, 1.0);
        uv = texcoord;
    }

fragment:
    uniform sampler2D op1, op2;
    varying vec2 uv;

    void main(void){
        gl_FragColor = (texture2D(op1, uv) + texture2D(op2, uv))/2.0;
    }
