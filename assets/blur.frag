precision mediump float;




// texcoords from the vertex shader
varying vec2 vTexCoord;

// our texture coming from p5
uniform sampler2D tex0;

// the size of a texel or 1.0 / width , 1.0 / height
uniform vec2 texelSize;
uniform float amp;

uniform float u_time;
// which way to blur, vec2(1.0, 0.0) is horizontal, vec2(0.0, 1.0) is vertical


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

float getff(vec2 st, float time){
    vec2 qq = vec2(0.);
    qq.x = fbm3( st + 0.1, time*.04);
    qq.y = fbm3( st + vec2(1.0), time*.04);
    vec2 rr = vec2(0.);
    rr.x = fbm3( st + 1.0*qq + vec2(1.7,9.2)+ 0.15*time*0., time*.04);
    rr.y = fbm3( st + 1.0*qq + vec2(8.3,2.8)+ 0.126*time*0., time*.04);
    float ff = fbm3(st+rr, time*.04);
    ff = (ff*ff*ff+0.120*ff*ff+.5*ff);
    ff = 1.4*ff*ff + .2;
	//ff = smoothstep(.16, .88, ff);
    return ff;
}


void main() {

  	vec2 uv = gl_FragCoord.xy*texelSize;
    vec2 st = uv*vec2(1., 1.);
    uv = uv/2.;
    uv.y = 1. - uv.y;

    float Nx = 12.;
    float Ny = 3.;
    float xq = floor(uv.x*Nx)/Nx;
    float yq = floor(uv.y*Ny)/Ny;

    vec2 stq = st;
    stq.x = pow(stq.x, 2.) + xq*123.;
    stq.y = pow(stq.y, 2.) + yq*123.;

    stq *= .4;

    float rndm1 = randomNoise(uv+mod(u_time*.001, .3)+fbm(uv));
    float rndm2 = randomNoise(uv+mod(u_time*.001, .3)+fbm(uv)+.2131);

    float aa1 = getff(stq*.3, u_time*.3);
    float fx1 = getff(stq+1.52, u_time*.2)+ .14*(-.5 + rndm1);
    float fy1 = getff(stq+.5, u_time*.2)+ .14*(-.5 + rndm2);
    //fx1 = mod(fx1, .2)*5.;
    stq *= 11.4;
    //fx2 = mod(fx2, .2)*5.;

    vec2 nz = vec2(fx1-.5, fy1-.5)*vec2(1.,1.)*texelSize * 6.;
    vec4 col1 = texture2D(tex0, uv);
    vec4 col2 = texture2D(tex0, uv + nz);
    float pp = 0.3;
    vec4 col = col1*pp + (1.-pp)*col2 + .25*(-.5 + rndm1);
    //col = col*1.001;
    col.a = 1.;

  	gl_FragColor = vec4(vec3(aa1), 1.0);
  	gl_FragColor = col;

}