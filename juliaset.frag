const vec2 c = vec2(-0.8, 0.1561);
const int numIter = 20;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
	vec2 uv = fragCoord.xy / iResolution.xy + (iMouse.xy*2.0 / iResolution.xy)*0.5 - 0.5;

    vec2 z;
    float scale = 1.0;
    z.x = scale * 3.0 * (uv.x - 0.5);
    z.y = scale * 2.0 * (uv.y - 0.5);

    int iter = 0;
    float q = 0.0;
    
    for(int i = 0;i < numIter;++i) 
    {
        iter = i;
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (z.y * z.x + z.x * z.y) + c.y;

        q = x * x + y * y;
        if((x * x + y * y) > 4.0)
            break;
        
        z.x = x;
        z.y = y;
    }
	++iter;
    
    if(iter == numIter)
    	fragColor = vec4(vec3(0.8,q*0.66,1), 1);
    else
    	fragColor = vec4(0.1,(float(iter) /float(numIter))*0.4,0,1);
}