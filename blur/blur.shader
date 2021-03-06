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
    uniform sampler2D source, normaldepth;
    uniform float distance_factor, depth_power;
    uniform float normal_factor, normal_power;
    uniform vec2 viewport, axis;
    varying vec2 uv;

    /*
    float sample_depth(vec2 uv){
        vec2 src = texture2D(normaldepth, uv).zw; 
        float depth = src.x/255.0+src.y;
        return pow(depth, depth_power);
    }
    */

    vec4 sample(vec2 uv){
        return texture2D(source, uv);
    }
    
    vec3 decode_normal(vec4 data){
        vec2 enc = data.xy;
        vec2 fenc = enc*4.0-2.0;
        float f = dot(fenc,fenc);
        float g = sqrt(1.0-f/4.0);
        return normalize(vec3(fenc*g, 1.0-f/2.0));
    }

    float decode_depth(vec4 data){
        vec2 src = data.zw;
        float depth = src.x/255.0+src.y;
        return depth;
    }

    vec4 sample_normaldepth(vec2 uv){
        vec4 data = texture2D(normaldepth, uv);
        return vec4(decode_normal(data), decode_depth(data));
    }

    void main(void){
        vec2 off = (axis*1.0)/viewport;

        vec4 da = sample_normaldepth(uv);
        vec4 db = sample_normaldepth(uv+off);
        vec4 dc = sample_normaldepth(uv-off);

        float fdb = 1.0-smoothstep(0.0, 1.0, distance_factor*abs(db.w-da.w));
        float fdc = 1.0-smoothstep(0.0, 1.0, distance_factor*abs(dc.w-da.w));
        float fnb = max(0.0, pow(dot(da.xyz, db.xyz)*normal_factor, normal_power));
        float fnc = max(0.0, pow(dot(da.xyz, dc.xyz)*normal_factor, normal_power));

        vec4 a = sample(uv);
        vec4 b = sample(uv+off)*1.0*fdb*fnb;
        vec4 c = sample(uv-off)*1.0*fdc*fnc;
        vec4 result = a+b+c;
        result /= (1.0 + 1.0*fdb*fnb + 1.0*fdc*fnc);
        gl_FragColor = result;
    }
