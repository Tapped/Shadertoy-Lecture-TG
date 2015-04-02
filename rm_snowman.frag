#define RM_ITER_COUNT 32
#define RM_SHADOW_ITER_COUNT 16

const float eps = 0.3;
const vec3 floorColor = vec3(0.1,0.1,0.1);
const vec3 snowmanColor = vec3(1.,.8,0.8);
const vec3 hatColor = vec3(0.1, 0.1, 0.1);

float sphere(in vec3 p, in float radius)
{
    return length(p) - radius;
}

float cone(in vec3 p, in vec2 c)
{
    // c must be normalized
    float q = length(p.xy) * 20.;
    return dot(c,vec2(q,p.z));
}

float roundBox(vec3 p, vec3 b, float r)
{
    return length(max(abs(p)-b,0.0))-r;
}

float cappedCylinder(vec3 p, vec2 h)
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float capsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 pa = p - a, ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
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

vec3 rotateY(in vec3 p, float a)
{
    vec3 r;
    float sinA = sin(a);
    float cosA = cos(a);    
    r.x = p.x*cosA - p.y*sinA;
    r.y = p.x*sinA + p.y*cosA;
    r.z = p.z;
    return r;
}

float armDisplacement(in vec3 p)
{
    return capsule(rotateY(p-vec3(0,1.2,0),sin(iGlobalTime*2.)*0.2), vec3(-2,0,0), vec3(2,0,0), 0.1);
}

float hatGen(in vec3 p)
{
    return min(cappedCylinder(p-vec3(0,0.3,0),vec2(0.3,0.3)), cappedCylinder(p,vec2(0.6,0.05)));
}

float snowman(in vec3 p, out int mat)
{
    float hat = hatGen(p-vec3(0,2.5,0));
    float head = sphere(p-vec3(0,2.1,0), 0.5);
    float eyeLeft = sphere(p-vec3(-0.2,2.2,0.37),0.1);
    float eyeRight = sphere(p-vec3(0.2,2.2,0.37),0.1);
    float body = sphere(p-vec3(0,1.1,0), 0.8);
    float legs = sphere(p-vec3(0,0,0), 1.);
    float arm = armDisplacement(p);    
    float snowMan = min(head, min(min(body, arm), legs)); 
    if(hat < snowMan)
        mat = 1;
    if(eyeLeft < snowMan || eyeRight < snowMan)
        mat = 2;
    
    //float nose = cone(p - vec3(0,2,-5.), normalize(vec2(0.4,0.1)));
    return min(hat,min(snowMan,min(eyeLeft,eyeRight)));
}

float repSnowman(vec3 p, vec3 c, out int mat)
{
    vec3 q = mod(p,c)-0.5*c;
    return snowman(q, mat);
}

float scene(in vec3 p, out int mat)
{
    //repSnowman(p-vec3(0,sin(iGlobalTime*4.)*0.5+0.5,0, vec3(5,0,5), mat)
    //snowman(p-vec3(0,sin(iGlobalTime*4.)*0.5+0.5,0), mat)
    float y = max(sin(iGlobalTime*10.),0.);
    p.z -= iGlobalTime * 0.5;
    return min(repSnowman(p-vec3(0,y,0), vec3(5,0,5), mat), dot(p, vec3(0,1,0)) + 1.);
}

vec3 calcNormal(in vec3 p)
{
    vec3 normal;
    vec3 ep = vec3(eps, 0, 0);
    int res = 0;
    normal.x = scene(p + ep.xyz, res) - scene(p - ep.xyz, res);
    normal.y = scene(p + ep.yxz, res) - scene(p - ep.yxz, res);
    normal.z = scene(p + ep.yzx, res) - scene(p - ep.yzx, res);
    return normalize(normal);
}

float calcShadowFactor(in vec3 p, in vec3 norm, in vec3 lDir)
{
    float t = .0;
    vec3 rayStart = p + norm * eps*3.; 
    for(int i = 0;i < RM_SHADOW_ITER_COUNT;++i)
    {
        vec3 sP = rayStart - lDir * t;
        int mat;
        float dist = scene(sP, mat); 
        if(dist < eps)
        {
            return 1.;
        }

        t += dist;
    }

    return 0.;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = vec2((fragCoord.x - iResolution.x * .5) / iResolution.y, 
                   (fragCoord.y - iResolution.y * .5) / iResolution.y);

    vec3 finalColor = vec3(0,0,0);

    vec3 rayStart = vec3(0,4,7);
    vec3 rayDir = normalize(vec3(uv, -1));
    rayDir = rotateX(rayDir, -3.14 * 0.15);
    float t = 0.0;

    for(int i = 0;i < RM_ITER_COUNT;++i)
    {
        vec3 p = rayStart + rayDir * t;
        int mat;
        float dist = scene(p, mat);
        
        if(dist < eps)
        {
            vec3 normal = calcNormal(p);
            vec3 lDir = vec3(sin(iGlobalTime*0.7), -0.5, cos(iGlobalTime*0.7));
            float diffuseFactor = max(dot(normal, -lDir), 0.0);
            float shadow = 0.;//calcShadowFactor(p, normal, lDir);
            
            vec3 diffuseColor = floorColor;
            
            if(p.y > -0.6)
                diffuseColor = snowmanColor;
            if(mat == 1)
                diffuseColor = hatColor;
            
            if(mat != 2)
                finalColor = vec3(.1,.1,.1) + vec3((1.-shadow) * diffuseFactor * diffuseColor);
            else
                finalColor = mix(vec3(0,0,1),vec3(1.,0,0),normal.z);
        }

        t += dist;
    }

    fragColor = vec4(finalColor, 1);
}