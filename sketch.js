let canvas;
var pg;

let effect;
var seed;
var mainfreq;
var columns;

function fxrandom(a, b){
    if(a && b){
        return a + fxrand()*(b-a);
    }
    if(a && !b){
        return fxrand()*a;
    }
    if(!a && !b){
        return fxrand();
    }
}


function preload() {
    effect = loadShader('assets/blur.vert', 'assets/blur.frag');
}

var mm;
function setup(){
    mm = min(800, min(windowWidth, windowHeight));
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);

    imageMode(CENTER);
    colorMode(HSB, 100);
    rectMode(CENTER);
    
    reset();
}


function draw(){
  
    effect.setUniform('resolution', [width, height]);
    effect.setUniform('time', millis()/1000.);
    effect.setUniform('mouse', [mouseX/width, mouseY/height]);
    effect.setUniform('seed', seed);
    effect.setUniform('columns', columns);
    effect.setUniform('mainfreq', mainfreq);
    shader(effect);
    quad(-1,-1,1,-1,1,1,-1,1);
}

var shapes = [];
var brushsize = 40;

function show(){
}

function reset(){
    seed = random(100.);
    mainfreq = random(3., 100.);
    if(random(100) < 50)
        mainfreq = random(3, 30);
    else
        mainfreq = random(230, 400);
    
    if(random(100) < 30)
        columns = random(6., 33);
    else
        columns = random(222, 666);
    
}

function mouseClicked(){
    reset();
}

function touchEnded(){
    reset();
}


function windowResized() {
    mm = min(800, min(windowWidth, windowHeight));
    resizeCanvas(windowWidth, windowHeight);
    //reset();
    show();
}

function power(p, g) {
    if (p < 0.5)
    return 0.5 * pow(2*p, g);
    else
    return 1 - 0.5 * pow(2*(1 - p), g);
}


const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

let perlin_octaves = 4; 
let perlin_amp_falloff = 0.5; 

const scaled_cosine = i => 0.5 * (1.0 - Math.cos(i * Math.PI));
let perlin;


nnoise = function(x, y = 0, z = 0) {
    if (perlin == null) {
        perlin = new Array(PERLIN_SIZE + 1);
        for (let i = 0; i < PERLIN_SIZE + 1; i++) {
            perlin[i] = fxrand();
        }
    }
    
    if (x < 0) {
        x = -x;
    }
    if (y < 0) {
        y = -y;
    }
    if (z < 0) {
        z = -z;
    }
    
    let xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
    let xf = x - xi;
    let yf = y - yi;
    let zf = z - zi;
    let rxf, ryf;
    
    let r = 0;
    let ampl = 0.5;
    
    let n1, n2, n3;
    
    for (let o = 0; o < perlin_octaves; o++) {
        let of = xi + (yi << PERLIN_YWRAPB) + (zi << PERLIN_ZWRAPB);
        
        rxf = scaled_cosine(xf);
        ryf = scaled_cosine(yf);
        
        n1 = perlin[of & PERLIN_SIZE];
        n1 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n1);
        n2 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n2);
        n1 += ryf * (n2 - n1);
        
        of += PERLIN_ZWRAP;
        n2 = perlin[of & PERLIN_SIZE];
        n2 += rxf * (perlin[(of + 1) & PERLIN_SIZE] - n2);
        n3 = perlin[(of + PERLIN_YWRAP) & PERLIN_SIZE];
        n3 += rxf * (perlin[(of + PERLIN_YWRAP + 1) & PERLIN_SIZE] - n3);
        n2 += ryf * (n3 - n2);
        
        n1 += scaled_cosine(zf) * (n2 - n1);
        
        r += n1 * ampl;
        ampl *= perlin_amp_falloff;
        xi <<= 1;
        xf *= 2;
        yi <<= 1;
        yf *= 2;
        zi <<= 1;
        zf *= 2;
        
        if (xf >= 1.0) {
            xi++;
            xf--;
        }
        if (yf >= 1.0) {
            yi++;
            yf--;
        }
        if (zf >= 1.0) {
            zi++;
            zf--;
        }
    }
    return r;
};

var noiseDetail = function(lod, falloff) {
    if (lod > 0) {
        perlin_octaves = lod;
    }
    if (falloff > 0) {
        perlin_amp_falloff = falloff;
    }
};

var noiseSeed = function(seed) {
    const lcg = (() => {
        const m = 4294967296;
        const a = 1664525;
        const c = 1013904223;
        let seed, z;
        return {
            setSeed(val) {
                z = seed = (val == null ? fxrand() * m : val) >>> 0;
            },
            getSeed() {
                return seed;
            },
            rand() {
                z = (a * z + c) % m;
                return z / m;
            }
        };
    })();
    
    lcg.setSeed(seed);
    perlin = new Array(PERLIN_SIZE + 1);
    for (let i = 0; i < PERLIN_SIZE + 1; i++) {
        perlin[i] = lcg.rand();
    }
};
