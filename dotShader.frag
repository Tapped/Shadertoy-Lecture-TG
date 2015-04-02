const float angle = 3.14;
const vec2 center = vec2(0.5);
const float scale = 0.5;

float pattern(vec2 uv)
{
    float s = sin(angle);
    float c = cos(angle);

    vec2 tex = uv*iResolution.xy - center;
    vec2 point = vec2(c*tex.x - s*tex.y, s*tex.x + c*tex.y) * scale;

    return sin(point.x) * sin(point.y) * 4.0;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
	vec4 color = texture2D(iChannel0, uv);
	float avg = (color.r + color.g + color.b) * 0.3333;

	fragColor = vec4(color.xyz * vec3(avg*10.0 - 5.0 + pattern(uv)), color.a);
}