vec2 encode_normal(vec3 normal)
{
    float f = sqrt(8.0*normal.z+8.0);
    return normal.xy / f + 0.5;
}

vec2 encode_depth(vec3 position){
    float depth = (length(position)-near)/far;
    depth = depth*255.0*255.0;
    return vec2(
        mod(depth, 255.0)/255.0,
        floor(depth/255.0)/255.0
    );
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

