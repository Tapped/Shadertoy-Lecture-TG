#define MAX_ITER 32
#define MIN_DISTANCE 0.01
#define MAX_DISTANCE 100.0

const float eps = 0.0001;
const float seed = 0.;

// ***** noise code ***************************************************
// Created by inigo quilez - iq/2013
// License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

//iq hash
float hash(float n)
{
    return fract(sin(n)*54321.98761234);  // value has no meaning that I could find
}

// iq derivative noise function
// returns vec3(noise, dnoise/dx, dnoise/dy)
vec3 noised(vec2 pos)
{
    pos += seed;
    vec2 p = floor(pos);
    vec2 f = fract(pos);
    
    vec2 u = (10.0+(-15.0+6.0*f)*f)*f*f*f;  // f=6*x^5-15*x^4+10*x^3  df/dx=30*x^4-60*x^3+30*x^2; horner of df is 30.0*f*f*(f*(f-2.0)+1.0)
    
    float n = p.x + p.y*57.0;
    
    float a = hash(n + 0.0);
    float b = hash(n + 1.0);
    float c = hash(n + 57.0); // do not know why 57 & 58
    float d = hash(n + 58.0);
    
    return vec3(a+(b-a)*u.x+(c-a)*u.y+(a-b-c+d)*u.x*u.y,
        30.0*f*f*(f*(f-2.0)+1.0) * (vec2(b-a,c-a)+(a-b-c+d)*u.yx));
}

//iq  noise function
/*float noise(vec2 x)
{
    vec2 p = floor(x);
    vec2 f = fract(x);
    
    f= (10.0+(-15.0+6.0*f)*f)*f*f*f; // smooth
    
    float n = p.x + p.y*57.0;
    
    float res = mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),
    mix( hash(n+ 57.0), hash(n+ 58.0),f.x),f.y);
    
    return res;
}*/

/* ****************************************************************** */

const mat3 fbMatrix = mat3(0.00,  0.80,  0.60,
                        -0.80,  0.36, -0.48,
                        -0.60, -0.48,  0.64);

vec3 displacement(in vec3 p)
{
    p += iGlobalTime*0.01;
    float dfx = 0.0;
    float dfy = 0.0;
    float f;

    vec3 n = noised(p.xz);
    f  = 0.5000*n.x; dfx += n.y; dfy += n.z; p = fbMatrix*p*2.02;
    n = noised(p.xz);
    f += 0.2500*n.x; dfx += n.y; dfy += n.z; p = fbMatrix*p*2.03;
    n = noised(p.xz);
    f += 0.1250*n.x; dfx += n.y; dfy += n.z; p = fbMatrix*p*2.01;
    n = noised(p.xz);
    f += 0.0625*n.x; dfx += n.y; dfy += n.z;

    return vec3(f, dfx, dfy);
}

vec3 scene(in vec3 p)
{
    vec3 res = displacement(p);
    //s.x *= 10.0;
    return res;
}

vec3 calcNormal(in vec2 derivative)
{
    return normalize(vec3(derivative.x, 1.0, derivative.y));
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

float sdCappedCylinder(vec3 p, vec2 h)
{
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

vec3 colorize(in vec3 p, in float dist)
{
    vec3 baseColor = vec3(0, 0, 0);
    vec3 groundColor = vec3(0.878, 0.482, 0.098);
    vec3 color = mix(baseColor, groundColor, vec3(p.y));
    color += mix(baseColor, vec3(0.878, 0.243, 0.098), vec3(p.y));
    return color;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = vec2((fragCoord.x - iResolution.x * .5) / iResolution.y, 
                   (fragCoord.y - iResolution.y * .5) / iResolution.y);     
    
    vec3 finalColor = vec3(0,0,0);

    vec3 rayStart = vec3(0,-iGlobalTime*0.4,4);
    vec3 rayDir = normalize(vec3(uv, -1));
    rayDir = rotateX(rayDir, -3.14 * 0.15); 
    float delt = 0.01;
    float t = MIN_DISTANCE;

    for(int i = 0;i < MAX_ITER;++i)
    {        
        if(t > MAX_DISTANCE)
            break;
        
        vec3 p = rayStart + rayDir * t;               
        
        vec3 height = scene(p);
        if(p.y < height.x)
        {
            vec3 normal = calcNormal(height.yz);
            // dot(normal, vec3(0.33)) * 
            finalColor = colorize(height, 0.);
        }

        t += delt;      
    }

    float factor = (uv.y + 1.) * .5;
    fragColor = (1.-factor) * vec4(finalColor, 1);
}