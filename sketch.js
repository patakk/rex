let canvas;
var pg;
var pass1;
var pass2;
var pass3;

let helvetica;
let pressstart;
let effect;
let blurH;
let blurV;

var shouldReset = true;

var colors;
var bgc;
var stc;
var randomhue = 0;

var D = 2000;

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
    helvetica = loadFont('assets/HelveticaNeueBd.ttf');
    pressstart = loadFont('assets/PressStart2P-Regular.ttf');
    effect = loadShader('assets/effect.vert', 'assets/effect.frag');
    blurH = loadShader('assets/blur.vert', 'assets/blur.frag');
    blurV = loadShader('assets/blur.vert', 'assets/blur.frag');
}

function setup(){
    var mm = min(min(windowWidth, windowHeight), 800);
    canvas = createCanvas(mm, mm, WEBGL);

    pass1 = createGraphics(D, D, WEBGL);
    pass2 = createGraphics(D, D, WEBGL);
    pass3 = createGraphics(D, D, WEBGL);
    pass1.noStroke();
    pass2.noStroke();
    pass3.noStroke();
    
    pg = createGraphics(D, D, WEBGL);
    pg.ortho(-D/2, D/2, -D/2, D/2, 0, 4444);
    pg.colorMode(HSB, 100);
    pg.imageMode(CENTER);

    randomhue = 0;
    imageMode(CENTER);
    colorMode(HSB, 100);
    rectMode(CENTER);
    redrawpg();
}

function redrawpg(){
    let r = 177;
    pg.background(3, 3, 3);
    pg.noStroke();
    for(var k = 0; k < 33; k++){
        pg.fill(random(100), 60, 3);
        pg.fill(random(100), 60, 80);
        //pg.ellipse(random(-D/2, D/2), random(-D/2, D/2), r, r);
    }
    randomhue = fxrandom(0, 100);
}

function draw(){
    for(var k = 0; k < 2; k++){
        shaderOnCanvas();
    }
    show();



    let xx1 = map(mouseX, 0, width, -D/2, D/2);
    let yy1 = map(mouseY, 0, height, -D/2, D/2);
    let xx2 = map(pmouseX, 0, width, -D/2, D/2);
    let yy2 = map(pmouseY, 0, height, -D/2, D/2);
    let dd = dist(xx1, yy1, xx2, yy2);
    let r = map(constrain(dd, 2, 30), 2, 30, 4, 133);
    brushsize = brushsize + .01*(r - brushsize);
}

var shapes = [];
var brushsize = 40;

function mouseDragged(){
    pg.fill(0, 0, randomhue);
    pg.fill(55, random(3, 9), 88);
    let xx1 = map(mouseX, 0, width, -D/2, D/2);
    let yy1 = map(mouseY, 0, height, -D/2, D/2);
    let xx2 = map(pmouseX, 0, width, -D/2, D/2);
    let yy2 = map(pmouseY, 0, height, -D/2, D/2);
    let dd = dist(xx1, yy1, xx2, yy2);
    let parts = dd/4;
    let r = map(constrain(dd, 2, 30), 2, 30, 4, 133);
    brushsize = brushsize + .01*(r - brushsize);
    for(var k = 0; k < parts; k++){
        let xx = lerp(xx1, xx2, k/parts);
        let yy = lerp(yy1, yy2, k/parts);
        pg.ellipse(xx, yy, brushsize, brushsize);
    }
}

function mouseReleased(){
    randomhue = random(0, 100);
    print(randomhue)
}


function shaderOnCanvas(){
    
    blurH.setUniform('tex0', pg);
    blurH.setUniform('texelSize', [1.0/D, 1.0/D]);
    blurH.setUniform('u_time', frameCount);
    blurH.setUniform('amp', .15);
    pass1.shader(blurH);
    pass1.quad(-1,-1,1,-1,1,1,-1,1);
    
    blurV.setUniform('tex0', pass1);
    blurV.setUniform('texelSize', [1.0/D, 1.0/D]);
    blurV.setUniform('u_time', frameCount);
    blurV.setUniform('amp', .15);
    pass2.shader(blurV);
    pass2.quad(-1,-1,1,-1,1,1,-1,1);
    
    effect.setUniform('tex0', pass2);
    effect.setUniform('tex1', pg);
    effect.setUniform('u_resolution', [D, D]);
    effect.setUniform('u_mouse', [D, D]);
    effect.setUniform('u_time', frameCount);
    effect.setUniform('incolor', [.93, .9, .88, 1.]);
    
    pass3.shader(effect);
    pass3.quad(-1,-1,1,-1,1,1,-1,1);

    if(frameCount>1)
        pg.image(pass1, 0, 0, D, D)
    
}

function show(){
    image(pass1, 0, 0, width, height);
    noFill();
    stroke(3, 2, 94);
    strokeWeight(max(width*.02, 10));
    rect(0, 0, width+2, height+2);
}

function mouseClicked(){

}


function windowResized() {
    var mm = min(min(windowWidth, windowHeight), 800);
    resizeCanvas(mm, mm);
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
