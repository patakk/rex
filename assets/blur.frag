precision mediump float;




// texcoords from the vertex shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;

// the size of a texel or 1.0 / width , 1.0 / height

// which way to blur, vec2(1.0, 0.0) is horizontal, vec2(0.0, 1.0) is vertical

#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float time;
uniform float seed;
uniform float columns;
uniform float mainfreq;
uniform vec2 mouse;
uniform vec2 resolution;

float randomNoise(vec2 p) {
  return fract(16791.414*sin(7.*p.x+p.y*73.41));
}

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float noise3 (in vec2 _st, in float t) {
    vec2 i = floor(_st+t);
    vec2 f = fract(_st+t);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fbm3 ( in vec2 _st, in float t) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise3(_st, t);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

float fff(vec2 st){
    st += mod(seed, 4.);
	vec2 q = vec2(0.);
	q.x = fbm3( st + 0.1, 0.*.11);
	q.y = fbm3( st + vec2(1.0), 0.*.11);
	vec2 r = vec2(0.);
	r.x = fbm3( st + 1.0*q + vec2(1.7,9.2)+ 0.15*0.*0., 0.*.11);
	r.y = fbm3( st + 1.0*q + vec2(8.3,2.8)+ 0.126*0.*0., 0.*.11);
	float f = fbm3(st+r, 0.*.11);
	
	float ff = (f*f*f+0.120*f*f+.5*f);

	
	return ff;
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main( void ) {

	vec2 pos = ( gl_FragCoord.xy / resolution.xy )/2.;
    pos.y = 1. - pos.y;
	//float Nx = mouse.x*333. + 1.;
	float Nx = columns;
	float bucketx = floor(pos.x*Nx);
	
	float off = .3*fff(vec2(bucketx, bucketx)/Nx*1.);
	
	float Ny = 201. + 200.*sin(time*.31 + off*mainfreq);
	float buckety = floor(pos.y*Ny);
	
	float ff = fff(vec2(buckety, buckety));

    float rr = random(vec2(seed));

	vec3 rgb = hsv2rgb(vec3(mod(mod(ff*rr, 1.1)+seed, 1.0)+.0, mod(mod(ff*.14, 1.1)+seed*.3, 1.), mod(mod(ff*1.44, 1.1)+seed*.23, 1.)));


	gl_FragColor = vec4( rgb, 1.0 );

}