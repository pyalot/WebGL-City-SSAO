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
    #define sample_count 16
    #define pattern_size 4.0

    uniform sampler2D normaldepth, random_field;

    uniform float radius, near, far, random_size;
    uniform float depth_bias, singularity, strength;

    uniform vec2 viewport;
    uniform vec3 samples[sample_count];
    uniform mat4 proj, inv_proj;
    uniform mat3 inv_rot;
    varying vec2 uv;
    
    vec3 decode_normal(vec2 enc){
        vec2 fenc = enc*4.0-2.0;
        float f = dot(fenc,fenc);
        float g = sqrt(1.0-f/4.0);
        return normalize(vec3(fenc*g, 1.0-f/2.0));
    }

    float decode_depth(vec2 src){
        float depth = src.x/255.0+src.y;
        return depth*far+near;
    }

    vec2 get_uv(vec3 pos){
        vec4 device = proj * vec4(pos, 1.0);
        vec4 device_norm = device/device.w;
        return (device_norm.xy+1.0)*0.5;
    }

    vec3 get_vec(vec2 uv){
        vec2 device = (uv*2.0)-1.0;
        return normalize((inv_proj * vec4(device.xy, -1.0, 1.0)).xyz);
    }
    
    vec3 getsample(int i){
        vec2 mod_coord = mod(floor(gl_FragCoord.xy), pattern_size);
        float y = ((mod_coord.x + mod_coord.y*pattern_size)+0.5) / (pattern_size*pattern_size);
        float x = (float(i)+0.5)/float(sample_count);
        return (texture2D(random_field, vec2(x, y)).xyz-0.5)*2.0;
    }
    
    void main(void){
        vec3 eye_ray = get_vec(uv);
        vec4 eye_data = texture2D(normaldepth, uv);
        vec3 eye_normal = decode_normal(eye_data.xy);
        float eye_depth = decode_depth(eye_data.zw);
        vec3 eye_pos = eye_depth * eye_ray;
      
        float occlusion = 0.0;
        
        for(int i=0; i<sample_count; i++){
            vec3 sample_offset = getsample(i) * radius;
            #ifdef sample_rotate
                sample_offset *= inv_rot;
            #endif
            sample_offset *= sign(dot(sample_offset, eye_normal));

            vec3 sample_pos = eye_pos + sample_offset;
            vec2 sample_uv = get_uv(sample_pos);
            vec3 sample_ray = get_vec(sample_uv);

            vec4 occluder_data = texture2D(normaldepth, sample_uv);
            float occluder_depth = decode_depth(occluder_data.zw);
            vec3 occluder_pos = sample_ray*occluder_depth;

            float diff = abs(occluder_pos.z+depth_bias - sample_pos.z);
            float occluded = occluder_pos.z+depth_bias > sample_pos.z ? 1.0 : 0.0;
            float dist_term = diff < singularity ? 1.0 : 0.0;
            float lambert = dot(normalize(sample_offset), eye_normal);
            occlusion += lambert*dist_term*occluded*strength;
        }

        occlusion = clamp(occlusion/float(sample_count), 0.0, 1.0);
        gl_FragColor = vec4(1.0 - occlusion);
    }
