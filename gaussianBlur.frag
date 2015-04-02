void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    const int numSamples = 10;
    float weights[numSamples + 1];
    weights[0] = 0.0260678;
    weights[1] = 0.052072;
    weights[2] = 0.0518185;
    weights[3] = 0.0513651;
    weights[4] = 0.0507173;
    weights[5] = 0.0498825;
    weights[6] = 0.0488702;
    weights[7] = 0.0476918;
    weights[8] = 0.0463604;
    weights[9] = 0.0448905;
    weights[10] = 0.0432978;
    
    float offsets[numSamples];
    offsets[0] = 1.49963;
    offsets[1] = 3.49915;
    offsets[2] = 5.49866;
    offsets[3] = 7.49817;
    offsets[4] = 9.49768;
    offsets[5] = 11.4972;
    offsets[6] = 13.4967;
    offsets[7] = 15.4962;
    offsets[8] = 17.4957;
    offsets[9] = 19.4952;
    
	vec2 uv = fragCoord.xy / iResolution.xy;
    
    vec4 sum = texture2D(iChannel0, uv) * weights[0];
    for(int i = 0;i < numSamples;++i)
    {
		sum += texture2D(iChannel0, uv + vec2(offsets[i] / iResolution.x, 0)) * weights[1 + i];
		sum += texture2D(iChannel0, uv - vec2(offsets[i] / iResolution.x, 0)) * weights[1 + i];
    }
    
	fragColor = sum;
}