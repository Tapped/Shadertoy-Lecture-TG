void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
   
   	vec2 stepSize = 1. / iResolution.xy; 
    
    vec3 s01 = texture2D(iChannel0,uv-vec2(1,0)*stepSize).xyz;
    vec3 s02 = texture2D(iChannel0,uv+vec2(1,0)*stepSize).xyz;
    vec3 s03 = texture2D(iChannel0,uv-vec2(0,1)*stepSize).xyz;
    vec3 s04 = texture2D(iChannel0,uv+vec2(0,1)*stepSize).xyz;
    vec3 s05 = texture2D(iChannel0,uv).xyz;
    
    vec3 grad1 = (s02 - s01);
    vec3 grad2 = (s04 - s03);
    vec3 avg = (grad2 + grad1) * 0.5;
    
    float l = length(avg);
    
    fragColor = vec4(s05 * l, 1.);
}