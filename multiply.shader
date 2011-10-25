/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
vertex:
    attribute vec3 position;
    attribute vec2 texcoord;
    varying vec2 v_texcoord;

    void main(void) {
        gl_Position = vec4(position, 1.0);
        v_texcoord = texcoord;
    }

fragment: depthutil
    varying vec2 v_texcoord;
    uniform sampler2D source, occlusionmap;
    float far = 1.0;
    float near = 0.0;

    vec3 decode_normal(vec2 enc)
    {
        vec2 fenc = enc*4.0-2.0;
        float f = dot(fenc,fenc);
        float g = sqrt(1.0-f/4.0);
        return vec3(fenc*g, 1.0-f/2.0);
    }

    float decode_depth(vec2 src){
        float depth = src.x/255.0+src.y;
        return depth*far+near;
    }

    void main(void){
        vec3 color = texture2D(source, v_texcoord).rgb;
        vec4 occlusion = texture2D(occlusionmap, v_texcoord);
        gl_FragColor = vec4(color*occlusion.a, 1.0);
    }
