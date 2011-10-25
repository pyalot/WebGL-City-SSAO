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
    #define sample_count 8

    uniform sampler2D normaldepth;
    #ifdef random_reflect
        uniform sampler2D random;
    #endif

    uniform float radius, near, far, random_size;
    uniform float dist_factor, dist_power;
    uniform float occlusion_factor, occlusion_power;
    uniform float sample_factor, sample_power;

    uniform vec2 viewport;
    uniform vec3 samples[sample_count];
    uniform mat4 proj, inv_proj;
    uniform mat3 inv_rot;
    varying vec2 uv;
    
    vec3 get_eye_normal(){
        vec2 frag_coord = gl_FragCoord.xy/viewport;
        frag_coord = (frag_coord-0.5)*2.0;
        vec4 device_normal = vec4(frag_coord, 0.0, 1.0);
        return normalize((inv_proj * device_normal).xyz);
    }
    
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
        vec3 eye_ray = get_eye_normal();
        vec4 eye_data = texture2D(normaldepth, uv);
        vec3 eye_normal = decode_normal(eye_data.xy);
        float eye_depth = decode_depth(eye_data.zw);
        vec3 eye_pos = eye_depth * eye_ray;
       
        #ifdef random_reflect
            vec3 random_vec = (texture2D(random, gl_FragCoord.xy/random_size).xyz-0.5)*2.0;
        #endif

        float occlusion = 0.0;
        float divider = 0.0;
        
        for(int i=0; i<sample_count; i++){
            vec3 sample_offset = samples[i] * radius;
            #ifdef sample_rotate
                sample_offset *= inv_rot;
            #endif
            #ifdef random_reflect
                sample_offset  = reflect(sample_offset, random_vec);
            #endif
            sample_offset *= sign(dot(sample_offset, eye_normal));

            float lambert = dot(normalize(sample_offset), eye_normal);
            float sample_length = length(sample_offset);

            vec3 sample_pos = eye_pos + sample_offset;
            float sample_depth = length(sample_pos);
        
            vec4 device = proj * vec4(sample_pos, 1.0);
            vec4 device_norm = device/device.w;
            vec2 screen_coord = (device_norm.xy+1.0)*0.5;

            vec4 occluder_data = texture2D(normaldepth, screen_coord);
            float occluder_depth = decode_depth(occluder_data.zw);
            vec3 occluder_pos = normalize(sample_pos)*occluder_depth;
            
            float len = mix(1.0, 0.0, clamp(sample_length*sample_factor, 0.0, 1.0));
            float diff = sample_depth - occluder_depth;
            float dist = mix(1.0, 0.0, clamp(diff*dist_factor, 0.0, 1.0));
 
            divider += lambert*pow(len, sample_power);
            if(sample_depth < occluder_depth){ //not occluded
                continue;
            }
            else{
            }
            if(sample_pos.z > 0.0){
                continue;
            }
            occlusion += lambert*pow(dist, dist_power)*pow(len, sample_power);
        }

        occlusion = clamp(occlusion/divider, 0.0, 1.0);
        gl_FragColor = vec4(vec3(1.0-pow(occlusion*occlusion_factor, occlusion_power)), 1.0);
    }
