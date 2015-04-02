#define RM_ITER_COUNT 32
#define RM_SHADOW_ITER_COUNT 16

const float eps = 0.1;
const vec3 floorColor = vec3(0.5,0.,1.);
const vec3 ballColor = vec3(1.,0.,0.);

float scene(in vec3 p)
{
	return min(length(p) - 0.5, dot(p, vec3(0,1,0)) + 1.);
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

float calcShadowFactor(in vec3 p, in vec3 norm, in vec3 lDir)
{
	float t = .0;
    vec3 rayStart = p + norm * eps*3.; 
	for(int i = 0;i < RM_SHADOW_ITER_COUNT;++i)
	{
		vec3 sP = rayStart - lDir * t;
		float dist = scene(sP); 
		if(dist < eps)
		{
			return 1.;
		}

		t += dist;
	}

	return 0.;
}

vec3 rotateX(in vec3 p, float a)
{
    vec3 r;
    float sinA = sin(a);
    float cosA = cos(a);
    r.x = p.x;
    r.y = p.y*cosA - p.z*sinA;
    r.z = p.y*sinA + p.z*cosA;
    return r;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
	vec2 uv = vec2((fragCoord.x - iResolution.x * .5) / iResolution.y, 
                   (fragCoord.y - iResolution.y * .5) / iResolution.y);

	vec4 finalColor = vec4(0,0,0,1);

	vec3 rayStart = vec3(0,2,4);
	vec3 rayDir = normalize(vec3(uv, -1));
	rayDir = rotateX(rayDir, -3.14 * 0.15);
	float t = 0.0;

	for(int i = 0;i < RM_ITER_COUNT;++i)
	{
		vec3 p = rayStart + rayDir * t;
		float dist = scene(p);
		if(dist < eps)
		{
			vec3 normal = calcNormal(p);
			vec3 lDir = vec3(sin(iGlobalTime), -0.5, cos(iGlobalTime));
			float diffuseFactor = max(dot(normal, -lDir), 0.0);
			float shadow = calcShadowFactor(p, normal, lDir);
            
            vec3 diffuseColor = floorColor;
            
            if(p.y > -0.6)
                diffuseColor = ballColor;
            
			finalColor = vec4((1.-shadow) * diffuseFactor * diffuseColor, 1);
		}

		t += dist;
	}

	fragColor = finalColor;
}