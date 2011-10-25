/*
    :copyright: 2011 by Florian Boesch <pyalot@gmail.com>.
    :license: GNU AGPL3, see LICENSE for more details.
*/
vertex:
    attribute vec3 position, normal;
    attribute vec2 texcoord;
    varying vec3 v_normal, v_position;
    varying vec2 v_texcoord;
    uniform mat4 proj, view, shadow_view;
    uniform float shadow_near, shadow_far;

    void main(void) {
        gl_Position = proj * view * vec4(position, 1.0);
        v_normal = normal;
        v_position = position;
        v_texcoord = texcoord;
    }

fragment:
    varying vec3 v_normal, v_position;
    varying vec2 v_texcoord;

    uniform float near, far, shadow_near, shadow_far;
    uniform vec2 viewport;
    uniform vec3 lightdir;
    uniform vec3 samples[16];
    uniform mat3 view_rot, inv_view_rot;
    uniform mat4 view, inv_proj, shadow_view, shadow_proj;
    uniform samplerCube diffuse_sun, diffuse_env, specular_sun, specular_env;
    uniform sampler2D shadowmap, diffuse_texture, specular_texture;

    vec2 unpack(vec4 src){
        //return src.x/255.0+src.y+src.z*255.0;
        //return src.x/255.0+src.y;
        return vec2(
            src.x/255.0+src.y,
            src.z/255.0+src.w
        );
    }
    
    vec3 get_world_normal(){
        vec2 frag_coord = gl_FragCoord.xy/viewport;
        frag_coord = (frag_coord-0.5)*2.0;
        vec4 device_normal = vec4(frag_coord, 0.0, 1.0);
        vec3 eye_normal = normalize((inv_proj * device_normal).xyz);
        vec3 world_normal = normalize(inv_view_rot*eye_normal);
        return world_normal;
    }
    
    void main(void){
        vec3 normal = normalize(v_normal);
        vec3 eye_normal = get_world_normal();
        vec4 shadow_pos = shadow_view * vec4(v_position, 1.0);
        vec4 shadow_device = shadow_proj * shadow_pos;
        vec4 shadow_device_normal = shadow_device / shadow_device.w;
        vec2 shadow_coord = (shadow_device.xy + 1.0) * 0.5;
        //float shadow_depth2 = shadow_pos.z - shadow_near;
        float shadow_depth2 = (shadow_pos.z - shadow_near)/(shadow_far-shadow_near)-0.002;

        float shadowed = 0.0;
        for(float y = -1.5; y<=1.5; y+=1.0){
            for(float x = -1.5; x<=1.5; x+=1.0){
                vec2 moments = unpack(texture2D(shadowmap, shadow_coord+vec2(x,y)/vec2(4092.0, 4092.0)));
                float p = float(shadow_depth2 >= moments.x);
                float variance = max(0.000015, moments.y - (moments.x*moments.x));
                float d = shadow_depth2 - moments.x;
                float p_max = variance/(variance + d*d);
                p_max = smoothstep(0.3, 1.0, p_max);
                shadowed += max(p, p_max);
                /*
                float shadow_depth1 = unpack(texture2D(shadowmap, shadow_coord+vec2(x,y)/vec2(4092.0, 4092.0)));
                float top = 0.001;
                float bottom = -0.2;
                float coeff = shadow_depth1 - shadow_depth2;
                if(coeff > top){
                    shadowed += 0.0;
                }
                else if(coeff <= bottom){
                    shadowed += 1.0;
                }
                else{
                    shadowed += pow(1.0 - coeff/(top-bottom), 0.5);
                }
                */
            }
        }
        shadowed = shadowed / 16.0;

        float lambert = pow(max(0.0, dot(normal, lightdir)), 0.5);
        //vec4 occlusion = texture2D(occlusionmap, gl_FragCoord.xy/viewport);

        vec4 lit_diffuse = pow(textureCube(diffuse_sun, normal), vec4(2.2));
        vec4 shadow_diffuse = pow(textureCube(diffuse_env, normal), vec4(2.2));

        vec3 specular_normal = reflect(eye_normal, normal);
       
        vec4 lit_specular = pow(textureCube(specular_sun, specular_normal), vec4(2.2));
        vec4 shadow_specular = pow(textureCube(specular_env, specular_normal), vec4(2.2));
        float specular_extinction = 1.0 - max(0.0, pow(dot(-eye_normal, normal), 0.5));

        vec3 diffuse_material = texture2D(diffuse_texture, v_texcoord).rgb;
        vec3 specular_material = mix(diffuse_material, vec3(1.0), 0.75);
        float specular_factor = texture2D(specular_texture, v_texcoord).r;

        vec3 diffuse_color = mix(shadow_diffuse, lit_diffuse, shadowed*lambert).rgb;
        vec3 specular_color = mix(shadow_specular, lit_specular, shadowed*lambert).rgb;
        //vec3 color = mix(diffuse_material*diffuse_color, specular_material*specular_color, specular_factor);
        vec3 color = diffuse_material*diffuse_color + specular_material*specular_color*specular_factor;
        gl_FragColor = vec4(pow(color, vec3(1.0/2.2)), 1.0);
    }
