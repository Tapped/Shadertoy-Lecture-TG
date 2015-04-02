#define RM_ITER_COUNT 32

const float eps = 0.00001;

float scene(in vec3 p)
{
	return length(p) - 1.;
}

vec3 calcNormal(in vec3 p)
{
	vec3 normal;
	vec3 ep = vec3(eps, 0, 0);
	normal.x = scene(p + ep.xyz) - scene(p - ep.xyz);
	normal.y = scene(p + ep.yxz) - scene(p - ep.yxz);
	normal.z = scene(p + ep.yzx) - scene(p - ep.yzx);
	return normalize(normal);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
	vec2 uv = vec2((fragCoord.x - iResolution.x * .5) / iResolution.y, 
                   (fragCoord.y - iResolution.y * .5) / iResolution.y);

	vec4 finalColor = vec4(0,0,0,1);

	vec3 rayStart = vec3(0,0,4);
	vec3 rayDir = normalize(vec3(uv, -1));	
	float t = 0.0;

	for(int i = 0;i < RM_ITER_COUNT;++i)
	{
		vec3 p = rayStart + rayDir * t;
		float dist = scene(p);
		if(dist < eps)
		{
			vec3 normal = calcNormal(p);
			float diffuseFactor = max(dot(normal, vec3(sin(iGlobalTime), cos(iGlobalTime), 1)), 0.0);
			finalColor = diffuseFactor * vec4(1,0,0,1);
		}

		t += dist;
	}

	fragColor = finalColor;
}