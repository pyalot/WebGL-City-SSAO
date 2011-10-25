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

    uniform sampler2D normaldepth, normalmap;
    uniform samplerCube environment;
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
    uniform mat3 rot, inv_rot;
    varying vec2 uv;
    
    vec3 decode_normal(vec2 enc){
        vec2 fenc = enc*4.0-2.0;
        float f = dot(fenc,fenc);
        float g = sqrt(1.0-f/4.0);
        return vec3(fenc*g, 1.0-f/2.0);
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
    
    void main(void){
        vec3 eye_ray = get_vec(uv);
        vec4 eye_data = texture2D(normaldepth, uv);
        vec3 eye_normal = decode_normal(eye_data.xy);
        //vec3 eye_normal = (texture2D(normalmap, uv).xyz-0.5)*2.0;
        float eye_depth = decode_depth(eye_data.zw);
        vec3 eye_pos = eye_depth * eye_ray;
       
        #ifdef random_reflect
            vec3 random_vec = (texture2D(random, gl_FragCoord.xy/random_size).xyz-0.5)*2.0;
        #endif

        //float occlusion = 0.0;
        float divider = 0.0;
        vec3 irradiance = vec3(0);
        
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
            vec2 sample_uv = get_uv(sample_pos);
            vec3 sample_ray = get_vec(sample_uv);

            vec4 occluder_data = texture2D(normaldepth, sample_uv);
            float occluder_depth = decode_depth(occluder_data.zw);
            vec3 occluder_pos = sample_ray*occluder_depth;
            
            float len = mix(1.0, 0.0, clamp(sample_length*sample_factor, 0.0, 1.0));
            float diff = occluder_pos.z - sample_pos.z;
            float dist = mix(1.0, 0.0, clamp(diff*dist_factor, 0.0, 1.0));
            
            float occlusion;
 
            //divider += lambert*pow(len, sample_power);
            if(occluder_pos.z < sample_pos.z){ //not occluded
                occlusion = 0.0; 
            }
            else if(sample_pos.z > 0.0){
                occlusion = 0.0; 
            }
            else{
                //occlusion = lambert*pow(dist, dist_power)*pow(len, sample_power)*occlusion_factor;
                //occlusion = pow(dist, dist_power)*pow(len, sample_power)*occlusion_factor;
                occlusion = pow(dist, dist_power)*occlusion_factor*lambert;
            }
            //occlusion += lambert*pow(dist, dist_power)*pow(len, sample_power);
            divider += lambert;
            //vec3 color = textureCube(environment, normalize(sample_offset)).rgb;
            //irradiance += textureCube(environment, inv_rot * normalize(sample_offset)).rgb * (1.0 - occlusion) * lambert;
            //irradiance += color * lambert;
            //irradiance += color * (1.0 - occlusion) * lambert;
            irradiance += (1.0 - occlusion) * lambert;
        }

        //occlusion = clamp(occlusion/divider, 0.0, 1.0);
        //occlusion /= float(sample_count);
        irradiance /= divider;
        //gl_FragColor = vec4(vec3(1.0-pow(occlusion*occlusion_factor, occlusion_power)), 1.0);
        gl_FragColor = vec4(irradiance, 1.0);
        //gl_FragColor = vec4((eye_normal+1.0)*0.5, 1.0);
    }
