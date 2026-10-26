import { CLUSTER_ANCHORS, MAX_STARS } from "./engines";

/**
 * File: app/components/background/shaders.ts
 * Description: The background engines, one fragment shader each, sharing one prelude (noise, the skin's six
 * colours, light-on-dark layering, tap pulses) and one epilogue (saturation, strength, grain).
 *
 * THE CONTRACT. An engine defines `vec3 engine(vec2 p, vec2 uv)` and returns the page as it should look at
 * full strength: it starts from the page colour (uBg) and layers colour onto it. The epilogue then mixes that
 * picture over the page colour by uS, the intensity (WHISPER 0.3, CORE 0.55, IMPACT 0.8), so 100% is a rich
 * picture and the levels step it back until text reads on top. `p` is the screen centred on the middle, one
 * unit tall, x scaled by the aspect (so it works in portrait and landscape); `uv` is 0..1 from the bottom left.
 *
 * COLOUR. NEVER a literal colour in here. Every colour is one of the skin's six (uC[0..5] = --node-1..6, read
 * by the host from the page and tweened when the skin or light mode changes), or the page colour, or white/black
 * mixed with those. That is what makes every engine follow every skin, gold's deeper aura ramp included.
 *
 * LIGHT AND DARK. `lay()` is the one layering function: on a dark page colour is added as light (screen), on a
 * light page it is laid as pigment (a mix), so one shader reads as light in the dark and as watercolour on paper.
 *
 * ACTIONS MOVE, THEY NEVER PULSE. A tap, a page change or a node opening only advances two smooth numbers: uTime (the
 * engine's own clock) and uPage (a drift counter). An engine uses them to float: positions, phases, drift. It never
 * changes a size or a brightness because of them: no swelling, no flashing, no breathing. (Both numbers are spring
 * smoothed by the host, so movement eases in, eases out and carries on along its path.)
 *   uStarA/B, uNova, uClA/B  (NEXUS only) the visitor's ELI-ME stars, the bursts, the pillar clusters.
 *
 * WebGL 1 (GLSL ES 1.00): no dynamic indexing of uniform arrays outside loop counters, so colours are read through
 * C(i) and stars through the loop index.
 */

export const PRELUDE = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2  uRes;
uniform float uTime;
uniform float uDark;
uniform float uS;
uniform float uSat;
uniform float uAmp;
uniform float uPage;
uniform vec3  uBg;
uniform vec3  uC[6];

float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}

// The skin's colour i (0..5). A loop compare, because fragment shaders cannot index a uniform array by a variable.
vec3 C(int i){vec3 r=uC[0];for(int j=1;j<6;j++){if(j==i)r=uC[j];}return r;}
// A smooth ramp through all six; x in 0..1.
vec3 ramp(float x){
  x=clamp(x,0.,1.)*5.;float f=fract(x);f=f*f*(3.-2.*f);int k=int(floor(x));
  return mix(C(k),C(k+1),f);
}
// Colour c laid onto col with weight k: light added on a dark page, pigment on a light one.
vec3 lay(vec3 col,vec3 c,float k){
  k=clamp(k,0.,1.);
  vec3 scr=1.-(1.-col)*(1.-c*k);
  return uDark>.5?scr:mix(col,c,k*.7);
}
// The page's own tint, for things that are paper or sky rather than light.
vec3 ink(vec3 c){return uDark>.5?c:c*.82;}
`;

export const EPILOGUE = `
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  vec3 col=engine(p,uv);
  float l=dot(col,vec3(.299,.587,.114));
  col=mix(vec3(l),col,uSat);                       // COLOUR motion raises the saturation
  col=mix(uBg,col,uS);                              // the intensity: how much of the picture shows
  col+=(hash(gl_FragCoord.xy)-.5)*(uDark>.5?.03:.02); // film grain: part of the look, and it stops banding
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}
`;

/* ------------------------------------------------------------------------------------------------ MARBLE
   Veined marble with glitter, from ActionLyst. Its body is a tint of the skin (the average of three of its
   colours), the veins and glitter run through the whole six-colour ramp. Almost still: the clock the host
   gives it moves a hair, only for a few seconds after something happens. */
const MARBLE = `
vec3 engine(vec2 p0,vec2 uv){
  float asp=uRes.x/uRes.y;
  vec2 p=(uv-.5)*vec2(asp,1.)*2.6;
  float t=3.+uTime+uPage*.05;
  vec2 q=vec2(fbm(p+vec2(0.,t)),fbm(p+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*.5),fbm(p+3.5*q+vec2(8.3,2.8)-t*.4));
  float f=fbm(p*.8+3.*r);
  vec2 c=uv-.5;
  float m=c.x*.9-c.y*.55+(f-.5)*.55+(r.x-.5)*.25;
  float body=1.-smoothstep(.16,.36,abs(m+.02));
  float lightL=smoothstep(-.15,-.45,m);
  float lightR=smoothstep(.1,.5,m);
  vec3 tint=(C(0)+C(2)+C(4))/3.;

  // how much of the marble's tint lies on the page here: the body is deep, the sides lighter
  float tone=.12+.5*f+.25*r.y;
  tone=mix(tone,.05+.3*f,body);
  tone+=lightL*.5+lightR*.25;
  tone=clamp(tone*.62,0.,1.);
  vec3 col=mix(uBg,ink(tint)*(uDark>.5?.62:1.),tone*(uDark>.5?1.:.8));
  col=lay(col,mix(tint,vec3(1.),.55),lightL*(1.-body)*.22);

  // veins
  float b=m+.02;
  float bw=abs(abs(b)-.2+(f-.5)*.22);
  float rid=1.-abs(fbm(p*3.+r*2.)*2.-1.);
  float vein=exp(-bw*110.)*(.3+.8*pow(rid,4.));
  float thin=pow(1.-abs(fbm(p*2.2+q*3.)*2.-1.),40.);
  float fine=pow(1.-abs(fbm(p*7.+r*4.)*2.-1.),14.)*exp(-bw*14.);
  float g=clamp(vein+thin*.4+fine*.7,0.,1.)*1.1;
  vec3 AX=ramp(clamp(uv.y*.8+uv.x*.3+(f-.5)*.7,0.,1.));
  vec3 vcol=mix(AX*.55,AX*1.1,pow(rid,2.));
  vcol=uDark>.5?vcol:vcol*.78;
  col=mix(col,clamp(vcol,0.,1.),clamp(g,0.,1.));

  // glitter, twinkling very slowly
  vec2 gp=uv*vec2(asp,1.)*260.;vec2 gi=floor(gp);
  float gh=hash(gi+.5);
  float spk=step(.985,gh)*smoothstep(.5,0.,length(fract(gp)-.5));
  float tw=.5+.5*sin(uTime*30.*gh+gh*40.);
  col+=(AX*.6+.4)*spk*tw*(g*1.6+.12)*(uDark>.5?.9:.35);

  if(uDark>.5)col*=1.-.25*dot(c,c)*2.;   // a soft vignette
  return col;
}`;

/* ------------------------------------------------------------------------------------------------ RADIANCE
   Daylight falling down the screen in six soft shafts, with a fan of rays from just above the top centre.
   A tap flares the shafts and rays nearest it. */
const RADIANCE = `
float rayAmt(vec2 d,float len,float ang,float widthRel,float shimmer,float lr){
  float a=atan(d.x,-d.y)-ang;
  float along=len*cos(a);
  if(along<=0.)return 0.;
  float off=len*sin(a);
  float u=along/lr;
  float halfW=widthRel*(.06+.94*u)*.5;
  float blur=.035;
  float across=1.-smoothstep(halfW-blur,halfW+blur,abs(off));
  float fall=u<.3?mix(1.,.67,u/.3):mix(.67,0.,clamp((u-.3)/.55,0.,1.));
  return across*fall*shimmer;
}
vec3 engine(vec2 p,vec2 uv){
  float asp=uRes.x/uRes.y;
  float t=uTime;
  vec3 col=uBg;
  // the sky the light falls through, never colourless
  col=lay(col,mix(C(0),C(5),smoothstep(0.,1.,uv.x)),(1.-smoothstep(0.,1.05,uv.y))*.22);

  // shafts: parallel daylight, leaning; they sway sideways, they never change strength
  float across=uv.x+(1.-uv.y)*.30+uPage*.015;
  float fall=1.-smoothstep(0.,1.18,1.-uv.y);
  float haze=.8+.2*fbm(vec2(across*3.,uv.y*2.-t*.15));
  for(int j=0;j<6;j++){
    float fj=float(j);
    float centre=.10+((fj+.5)/6.)*.80+.03*sin(t*.5+fj*2.1);
    float beam=1.-smoothstep(.23*.2,.23*1.15,abs(across-centre));
    col=lay(col,C(j),beam*fall*.8*haze*.62);
  }

  // rays: a fan from the top centre, one per colour; they sweep slowly, they never shimmer
  vec2 src=vec2(0.,.62);
  vec2 d=p-src;
  float len=length(d);
  float lr=1.25*max(1.,asp*.9);
  for(int k=0;k<6;k++){
    float fk=float(k);
    float ang=(-42.+fk/5.*84.+(hash(vec2(fk,3.7))-.5)*6.)*.0174533+.06*sin(t*.35+fk*1.7);
    float w=(100.+40.*hash(vec2(fk,9.1)))/390.*max(asp,.46);
    col=lay(col,C(k),rayAmt(d,len,ang,w,.65,lr)*.55);
  }
  // a glow at the source, so the fan has somewhere to come from
  vec2 q=(p-vec2(0.,.56))/vec2(.55*max(asp,.6),.32);
  float g=1.-smoothstep(0.,.75,length(q));
  col=lay(col,mix(vec3(.95),C(1),smoothstep(0.,.35,length(q))),g*.5);
  return col;
}`;

/* ------------------------------------------------------------------------------------------------ AURORA WAVES
   Three soft curtains swaying across the upper half, over a glow from the top. Curtains are summed, so the
   theme is there from the first frame. A tap makes the curtains swell; a page change slides them. */
const AURORA = `
float ribbon(float y,float centre,float width){float d=(y-centre)/width;return exp(-d*d);}
vec3 engine(vec2 p,vec2 uv){
  float y=1.-uv.y;
  float t=uTime*.35+uPage*.3;
  float y1=.20+.06*sin(uv.x*2.1+t)+.03*sin(uv.x*5.3-t*1.3);
  float y2=.36+.07*sin(uv.x*1.7-t*.8+1.9)+.03*sin(uv.x*4.1+t*1.1);
  float y3=.54+.06*sin(uv.x*2.6+t*.6+4.2);
  float folds=.72+.28*sin(uv.x*38.+sin(uv.x*7.+t)*2.);
  float r1=ribbon(y,y1,.10)*folds;
  float r2=ribbon(y,y2,.13)*(.85+.15*folds);
  float r3=ribbon(y,y3,.16);
  float sky=1.-smoothstep(0.,.85,y);
  vec3 col=uBg;
  col=mix(col,ink(C(5)),clamp(sky*.35,0.,1.));
  col=mix(col,ink(C(4)),clamp(r3*.55,0.,1.));
  col=mix(col,ink(C(2)),clamp(r2*.70,0.,1.));
  col=mix(col,ink(C(0)),clamp(r1*.85,0.,1.));
  return col;
}`;

/* ------------------------------------------------------------------------------------------------ GLASS PANELS
   A soft mesh gradient: four blobs of the skin's colours drifting on slow independent paths. */
const GLASS = `
vec3 engine(vec2 p,vec2 uv){
  float asp=uRes.x/uRes.y;
  vec2 uvA=vec2(uv.x*asp,1.-uv.y);
  float t=uTime+uPage*.6;
  vec2 c1=vec2(.22,.28)+vec2(sin(t*.10),cos(t*.08))*.16;
  vec2 c2=vec2(.80,.22)+vec2(cos(t*.12),sin(t*.14))*.16;
  vec2 c3=vec2(.76,.80)+vec2(sin(t*.08),cos(t*.11))*.18;
  vec2 c4=vec2(.20,.78)+vec2(cos(t*.13),sin(t*.09))*.16;
  float w1=smoothstep(.52,0.,length(uvA-vec2(c1.x*asp,c1.y)));
  float w2=smoothstep(.52,0.,length(uvA-vec2(c2.x*asp,c2.y)));
  float w3=smoothstep(.52,0.,length(uvA-vec2(c3.x*asp,c3.y)));
  float w4=smoothstep(.52,0.,length(uvA-vec2(c4.x*asp,c4.y)));
  float total=max(w1+w2+w3+w4,.0001);
  vec3 blend=(C(0)*w1+C(2)*w2+C(4)*w3+C(5)*w4)/total;
  return mix(uBg,ink(blend),clamp(total*.55,0.,1.));
}`;

/* ------------------------------------------------------------------------------------------------ ORBS
   Six soft balls of light, one per pillar colour, drifting. A tap swells the one nearest it. */
const ORBS = `
vec3 engine(vec2 p,vec2 uv){
  float asp=uRes.x/uRes.y;
  float md=max(1.,asp);
  float t=uTime+uPage*.5;
  vec3 col=uBg;
  for(int i=0;i<6;i++){
    float fi=float(i);
    vec2 c=vec2(sin(fi*2.4+1.3+t*.11*(1.+.2*fi))*(.42*asp+.06),cos(fi*1.9+.7+t*.09*(1.+.17*fi))*.44);
    float r=(.34+.05*mod(fi,3.))*md;
    vec2 d=p-c;
    float dd=dot(d,d)/(r*r);
    col=lay(col,C(i),exp(-dd*2.1)*.62);
    col=lay(col,mix(C(i),vec3(1.),.55),exp(-dd*9.)*.5);          // a hot core: a lit sphere, not a smudge
  }
  return col;
}`;

/* ------------------------------------------------------------------------------------------------ INK
   Drops of ink hanging in water, one plume per pillar colour. One shared fluid field bends every plume's
   distance, so they billow like a single body of water. A tap blooms the plume nearest it; a page change
   carries them to new places. */
const INK = `
vec3 engine(vec2 p,vec2 uv){
  float asp=uRes.x/uRes.y;
  float md=max(1.,asp);
  float t=uTime*.6;
  vec2 w=vec2(fbm(p*1.6+vec2(t*.05,-t*.04)+uPage*.15),fbm(p*1.6+vec2(5.2,1.3)-vec2(t*.04,t*.05)));
  vec2 q=p+(w-.5)*.9;                                                // the whole body of water is pushed about
  vec3 col=uBg;
  col=lay(col,ramp(uv.y*.8+.1),.10);                                 // a broad wash behind everything
  for(int i=0;i<6;i++){
    float fi=float(i);
    vec2 a=vec2((fract(.5+.7548776*(fi+1.)+uPage*.037)-.5)*asp,(fract(.5+.5698403*(fi+1.)+uPage*.029)-.5)*.95);
    float r=(.36+.08*hash(vec2(fi,1.7)))*md;
    float d=length(q-a);
    float dens=pow(1.-smoothstep(0.,r,d),1.5);
    dens*=.55+.7*fbm(q*3.+fi*4.);                                   // feathered, filamentary edges
    vec3 pc=mix(C(i),C(i)*.55,smoothstep(.45,1.,dens));
    col=lay(col,pc,dens*.9);
    float wisp=pow(1.-abs(fbm(q*2.8+fi*2.1)*2.-1.),7.)*dens;       // fine bright threads inside the smoke
    col=lay(col,mix(C(i),vec3(1.),.5),wisp*.5);
  }
  return col;
}`;

/* ------------------------------------------------------------------------------------------------ KINETIC RHYTHM
   Five wide beams of light sweeping across, each in a pillar colour. They keep their own tempo; a tap or a
   page change pushes them on. */
const RHYTHM = `
vec3 engine(vec2 p,vec2 uv){
  float asp=uRes.x/uRes.y;
  float md=max(1.,asp);
  vec3 col=uBg;
  col=lay(col,mix(C(2),C(4),.5),.08);
  for(int i=0;i<5;i++){
    float fi=float(i);
    float sweep=uTime*.5+fi*1.2+uPage*.8;
    float ang=(35.+sin(sweep)*15.+fi*25.)*.0174533;
    vec2 c=vec2(sin(sweep*.8)*.4*asp,cos(sweep*1.1)*.4);
    vec2 d=p-c;
    float x=d.x*cos(ang)+d.y*sin(ang);
    float w=(.2+.05*fi)*md;
    float u=clamp(x/(2.*w)+.5,0.,1.);
    float prof=sin(u*3.14159);
    prof*=prof;
    col=lay(col,C(i),prof*.62);
  }
  return col;
}`;

/* ------------------------------------------------------------------------------------------------ PARALLAX BOKEH
   Big soft circles in three depths. They slide against each other (the near ones further) on every page change,
   which is the parallax, and drift a little between. */
const BOKEH = `
vec3 engine(vec2 p,vec2 uv){
  float asp=uRes.x/uRes.y;
  float md=max(1.,asp);
  vec3 col=uBg;
  col=lay(col,mix(C(1),C(4),smoothstep(0.,1.,uv.x)),.10);
  for(int i=0;i<16;i++){
    float fi=float(i);
    float z=hash(vec2(fi,2.3));                                      // depth: near discs are big and slide far
    float par=uPage*(.04+.16*z)+uTime*.012*(.3+z);
    vec2 base=vec2(hash(vec2(fi,5.1)),hash(vec2(fi,8.7)));
    vec2 c=vec2((fract(base.x+par)-.5)*(asp+.3),(base.y-.5)*1.05);
    float r=(.05+.2*z*z)*md*.9;
    float d=length(p-c);
    float disc=1.-smoothstep(r*.9,r,d);
    float rim=smoothstep(r*.62,r*.92,d)*disc;                       // a real lens disc: a defined edge, brighter at the rim
    vec3 bc=C(int(mod(fi,6.)));
    col=lay(col,bc,disc*(.16+.14*z)+rim*(.22+.2*z));
  }
  return col;
}`;

/* ------------------------------------------------------------------------------------------------ NEXUS
   A curved band of thousands of tiny stars with dust lanes, in the skin's own colours, over a deep pool of the skin. A
   tap sets off a small star somewhere in the sky (never at your finger). It also draws your ELI-MEs: nothing until the
   first, which goes off in a supernova and stays. Then a pillar is the biggest star, a topic smaller, a subtopic
   smallest, and each pillar you have explained something in is a small galaxy of its own (the same recipe as the big
   one), fuller the more is explained. */
const anchorFn = `vec2 clAnchor(int i,float asp){
${CLUSTER_ANCHORS.map(([x, y], i) => `  if(i==${i})return vec2(${(x - 0.5).toFixed(3)}*asp,${(0.5 - y).toFixed(3)});`).join("\n")}
  return vec2(0.);
}`;
const GALAXY = `
uniform vec4 uStarA[${MAX_STARS}];   // x, y (p space), seconds since it appeared (-1 = none), pillar 0..5
uniform vec4 uStarB[${MAX_STARS}];   // seconds since its supernova (-1 = none), level 0 pillar / 1 topic / 2 subtopic, x, y of the previous star in its pillar (-99 = none)
uniform vec4 uNova[3];                // x, y (p space), seconds since it went off (-1 = none), colour 0..5: the small bursts a tap sets off in the sky
uniform vec4 uClA;                    // how much of pillars 0..3 is explained: the strength of their clusters (0 = not there yet)
uniform vec4 uClB;                    // pillars 4 and 5

${anchorFn}
float clStr(int i){if(i==0)return uClA.x;if(i==1)return uClA.y;if(i==2)return uClA.z;if(i==3)return uClA.w;if(i==4)return uClB.x;return uClB.y;}

float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/max(dot(ba,ba),.00001),0.,1.);return length(pa-ba*h);}
// A field star's colour: white (ink on paper) pulled toward one of the skin's own colours.
vec3 starTint(float h){return uDark>.5?mix(vec3(1.),ramp(h),.62):ramp(h)*.8;}

// Three layers of tiny stars on a jittered grid; band and core say how dense. Each star shines on its own phase.
void stars3(inout vec3 col,vec2 p,float band,float core,float scaleMul,float densMul,float seed,vec3 tint,float useTint){
  for(int L=0;L<3;L++){
    float fl=float(L);
    float sc=(90.+fl*95.+fl*fl*20.)*scaleMul;
    vec2 g=p*sc+fl*17.3+seed;
    vec2 gi=floor(g);
    float h=hash(gi+fl*3.1);
    float h2=hash(gi+71.7+fl);
    vec2 jit=(vec2(hash(gi+5.),hash(gi+9.))-.5)*.5;
    float d=length(fract(g)-.5-jit);
    float dens=(mix(.006,.15+.10*fl,band)+core*.30)*densMul;
    float s=step(1.-dens,h)*smoothstep(.30+.22*h2,0.,d);
    float shine=.8+.2*sin(uTime*3.+h*60.);
    vec3 tc=useTint>.5?(uDark>.5?mix(vec3(1.),tint,.65):tint*.8):starTint(hash(gi+13.7));
    col=lay(col,tc,s*(.35+.65*h2*h2)*(.55+.2*fl)*shine);
  }
}

// A star going off, e seconds after it began. strong is 0 for NORMAL and COLOUR (tiny, transparent, over in about a
// second) and 1 for OTT (faster, brighter, a second ripple behind the first). scale is its reach; big is 1 for a pillar's
// star and less for the smaller ones. In order, with easing: the star CHARGES (a point of light that builds and eases in),
// a BIG star first IMPLODES (a ring draws in on it as it charges), then it goes off: a thin ripple that fades quickly.
float chargeTime(float strong,float big){return strong*.2+big*.4;}
float chargeAt(float e,float strong,float big){
  float tc=chargeTime(strong,big);
  return tc>0.?smoothstep(0.,tc,e)*(1.-smoothstep(tc,tc+.1,e)):0.;
}
float novaLight(vec2 p,vec2 sp,float e,float scale,float strong,float big){
  float d=length(p-sp);
  float tc=chargeTime(strong,big);
  float light=exp(-d*d/(.0004*scale*scale+.00002))*chargeAt(e,strong,big)*(.5+.9*strong+.8*big);
  if(big>.05&&e<tc){
    float q=(d-(1.-e/tc)*.15*scale)/(.004*scale+.003);
    light+=exp(-q*q)*big*.6*smoothstep(0.,.08,e);
  }
  float ee=e-tc;
  if(ee>0.){
    float speed=mix(.38,.62,strong);
    float w=.0045*scale+.0035;
    float a=mix(.3,.75,strong)*(.55+.45*big);
    float fade=exp(-ee*mix(2.6,2.1,strong));
    float q1=(d-ee*speed*scale)/w;
    light+=exp(-q1*q1)*a*fade;
    float e2=ee-.13;
    if(e2>0.&&strong>.01){
      float q2=(d-e2*speed*.85*scale)/(w*.9);
      light+=exp(-q2*q2)*a*.65*fade*strong;
    }
  }
  return light;
}

vec3 engine(vec2 p,vec2 uv){
  float asp=uRes.x/uRes.y;
  float t=uTime+uPage*.4;
  float strong=clamp((uAmp-.8)/1.2,0.,1.);                            // 0 on NORMAL and COLOUR, 1 on OTT
  vec3 col=uBg;
  col=lay(col,mix(C(2),C(4),.5),(.10+.10*(1.-uv.y))*.5);               // the deep pool

  // The galaxy: a curved diagonal band, brightest through its middle, with dust lanes cut across it.
  vec2 dir=normalize(vec2(.82,.57));
  vec2 nrm=vec2(-dir.y,dir.x);
  float along=dot(p,dir);
  float acr=dot(p,nrm)+.09*sin(along*2.7+1.)+(fbm(p*1.6+vec2(3.,1.)+t*.01)-.5)*.16;
  float band=exp(-acr*acr/.045);
  float core=exp(-acr*acr/.006)*exp(-along*along/.55);
  float cl=fbm(p*3.4+vec2(8.,2.)+t*.012);
  float lane=smoothstep(.5,.66,fbm(p*2.2+vec2(2.,9.)));
  vec3 bandCol=ramp(clamp(.5+along*.55+(cl-.5)*.5,0.,1.));            // the colour travels along the band through the skin
  col=lay(col,bandCol,band*(.10+.26*cl)*(1.-.6*lane));
  col=lay(col,mix(bandCol,vec3(1.),.4),core*.30*(1.-.5*lane));

  for(int i=0;i<3;i++){                                                // a few faint clouds elsewhere
    float fi=float(i);
    vec2 cp=vec2(sin(t*.03+fi*2.3)*.5*asp,cos(t*.025+fi*2.9)*.42);
    vec2 d=p-cp;
    col=lay(col,C(i*2),exp(-dot(d,d)/(.2+.04*fi))*(.2+.5*fbm(p*2.2+fi*3.1))*.4);
  }
  stars3(col,p,band,core,1.,.7,0.,vec3(0.),0.);                        // the field: fewer stars, so there is room for the clusters

  // Each pillar you have explained something in is a small galaxy of its own, in its colour: the same recipe as the
  // big one (an elongated glow, dust, tiny stars), fuller the more is explained in it.
  for(int i=0;i<6;i++){
    float cs=clStr(i);
    if(cs>.001){
      vec2 c=clAnchor(i,asp);
      vec2 d=p-c;
      if(dot(d,d)<.2){
        float fi=float(i);
        float an=hash(vec2(fi,3.3))*3.14159;
        vec2 q=vec2(cos(an)*d.x+sin(an)*d.y,-sin(an)*d.x+cos(an)*d.y);
        float acr2=q.y+.025*sin(q.x*16.+fi);
        float cb=exp(-acr2*acr2/.0016)*exp(-q.x*q.x/.022);
        float cc=exp(-dot(d,d)/.0012);
        float cn=fbm(d*8.+fi*5.);
        vec3 tc=C(i);
        col=lay(col,mix(tc,vec3(1.),.2),(cb*(.08+.22*cn)+cc*.2)*cs);
        stars3(col,d,cb*cs,cc*cs,1.7,2.0,fi*31.,tc,1.);
      }
    }
  }

  for(int j=0;j<3;j++){                                                // a click sets off a small star right where it landed
    vec4 N=uNova[j];
    if(N.z>=0.&&N.z<2.4){
      vec3 nc=C(int(N.w+.5));
      col=lay(col,uDark>.5?mix(nc,vec3(1.),.6):nc*.75,novaLight(p,N.xy,N.z,.38+.3*strong,strong,0.));
    }
  }

  for(int i=0;i<${MAX_STARS};i++){                                       // your ELI-MEs
    vec4 A=uStarA[i];
    if(A.z>=0.){
      vec4 B=uStarB[i];
      vec2 sp=A.xy;
      float lv=B.y;
      vec3 sc=C(int(A.w+.5));
      vec3 hot=uDark>.5?mix(sc,vec3(1.),.65):sc*.75;
      float born=1.-exp(-A.z*1.6);
      float base=lv<.5?.026:lv<1.5?.016:.0095;                          // a pillar is the biggest, a subtopic the smallest
      float bigness=lv<.5?1.:lv<1.5?.5:0.;                              // pillars implode then explode, topics a little, subtopics just go off
      float chg=(B.x>=0.&&B.x<4.)?chargeAt(B.x,strong,bigness):0.;
      float size=base*born*(1.+chg*.6);
      vec2 d=p-sp;
      float dd=dot(d,d);
      float core2=exp(-dd/(size*size));
      float bloom=exp(-dd/(size*size*9.))*.6;
      float neb=0.,nl=0.;
      if(B.x>=0.){
        neb=smoothstep(0.,1.6,B.x)*exp(-dd/(.014-.004*lv))*(.30-.07*lv);
        if(B.x<4.)nl=novaLight(p,sp,B.x,1.-.25*lv,strong,bigness);
      }
      if(B.z>-50.){                                                    // a hairline to the last star of its pillar
        float ds=seg(p,sp,B.zw);
        col=lay(col,hot,exp(-ds*ds/.0000016)*.5*smoothstep(0.,2.4,A.z));
      }
      col=lay(col,sc,bloom+neb);
      col=lay(col,hot,core2*(1.3+chg*3.)+nl);
    }
  }
  return col;
}`;

export interface EngineSource {
  /** GLSL for the engine function; undefined for the engines that are not shaders (OFF, SCENERY). */
  src?: string;
  /** How fast the engine's own clock runs against MOTION's speed (1 = as MOTION says). */
  speed: number;
  /** Scales the intensity for this engine: the wide, bright ones (a screen full of light) sit lower so IMPACT still reads under text. */
  gain: number;
  /** Render scale against the screen (default 0.5: every engine is soft). NEXUS's tiny stars need more. */
  res?: number;
  /** Extra uniforms this engine reads, so the host knows to feed them. */
  stars?: boolean;
}

export const SOURCES: Record<string, EngineSource> = {
  marble: { src: MARBLE, speed: 0.035, gain: 0.9 },     // barely moves: a hair of drift per action
  radiance: { src: RADIANCE, speed: 1, gain: 0.75 },
  aurora: { src: AURORA, speed: 1, gain: 0.7 },
  glass: { src: GLASS, speed: 1, gain: 0.65 },
  orbs: { src: ORBS, speed: 0.5, gain: 0.8 },         // barely moves
  ink: { src: INK, speed: 1, gain: 0.8 },
  rhythm: { src: RHYTHM, speed: 1, gain: 0.5 },
  bokeh: { src: BOKEH, speed: 1, gain: 0.75 },
  galaxy: { src: GALAXY, speed: 1, gain: 0.75, res: 0.75, stars: true },  // finer: its stars are a pixel or two
};

export const fragmentFor = (id: string): string | null => {
  const s = SOURCES[id];
  return s?.src ? PRELUDE + s.src + EPILOGUE : null;
};
