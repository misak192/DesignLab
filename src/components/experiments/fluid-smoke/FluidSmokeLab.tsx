/**
 * File: src/components/experiments/fluid-smoke/FluidSmokeLab.tsx
 * Description: Self-contained experiment for live fluid / ink-smoke shader backgrounds.
 * Features a WebGL fragment shader reacting to cursor velocity, scroll offset, and time of day,
 * alongside complete Android AGSL (Compose Android 13+) implementation snippets.
 */
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDisplay, useMotion } from '@/components/display/DisplayProvider';

const FLUID_SMOKE_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uCursor;
uniform float uCursorVel;
uniform float uScroll;
uniform float uTimeOfDay; // 0..24 hours
uniform float uViscosity;
uniform float uDark;
uniform vec3  uC[6];
uniform vec3  uBg;

float hash(vec2 p){
  vec3 q=fract(vec3(p.xyx)*.1031);
  q+=dot(q,q.yzx+33.33);
  return fract((q.x+q.y)*q.z);
}

float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}

float fbm(vec2 p){
  float v=0., a=.5;
  mat2 m=mat2(1.6,1.2,-1.2,1.6);
  for(int i=0;i<5;i++){
    v+=a*noise(p);
    p=m*p;
    a*=.5;
  }
  return v;
}

vec3 getTimeOfDayTint(float h) {
  // h in 0..24
  // 6: Dawn (amber/rose), 12: Noon (sky cyan), 18: Dusk (violet/coral), 24/0: Midnight (deep blue/obsidian)
  if (h < 6.0) {
    float f = h / 6.0;
    return mix(vec3(0.08, 0.09, 0.18), vec3(0.42, 0.22, 0.35), f);
  } else if (h < 12.0) {
    float f = (h - 6.0) / 6.0;
    return mix(vec3(0.42, 0.22, 0.35), vec3(0.15, 0.45, 0.62), f);
  } else if (h < 18.0) {
    float f = (h - 12.0) / 6.0;
    return mix(vec3(0.15, 0.45, 0.62), vec3(0.55, 0.25, 0.40), f);
  } else {
    float f = (h - 18.0) / 6.0;
    return mix(vec3(0.55, 0.25, 0.40), vec3(0.08, 0.09, 0.18), f);
  }
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * 2.2;

  // React to scroll
  p.y += uScroll * 0.0018;

  // React to cursor advection
  vec2 curP = (uCursor - 0.5) * vec2(aspect, 1.0) * 2.2;
  float curDist = length(p - curP);
  float curPush = exp(-curDist * curDist * 3.5) * uCursorVel * 1.8;
  vec2 curDir = normalize(p - curP + 0.0001);
  p += curDir * curPush;

  float t = uTime * mix(0.18, 0.65, uViscosity);

  // Curl noise advection for fluid plumes
  vec2 q = vec2(
    fbm(p * 1.4 + vec2(t * 0.2, -t * 0.15)),
    fbm(p * 1.4 + vec2(5.2, 1.3) + vec2(-t * 0.18, t * 0.22))
  );

  vec2 r = vec2(
    fbm(p * 1.8 + 2.5 * q + vec2(1.7, 9.2) + t * 0.1),
    fbm(p * 1.8 + 2.5 * q + vec2(8.3, 2.8) - t * 0.12)
  );

  float smoke = fbm(p + 3.0 * r);

  // Time of day influence
  vec3 tod = getTimeOfDayTint(uTimeOfDay);

  // Skin color blend
  vec3 cPrimary = uC[0];
  vec3 cSecondary = uC[2];
  vec3 cAccent = uC[4];

  vec3 plumeCol = mix(cPrimary, cSecondary, smoothstep(0.2, 0.7, smoke));
  plumeCol = mix(plumeCol, cAccent, smoothstep(0.65, 0.95, length(r)));
  plumeCol = mix(plumeCol, tod, 0.35);

  float density = smoothstep(0.25, 0.75, smoke);
  vec3 outCol = mix(uBg, plumeCol, density * 0.78);

  // Film grain
  float grain = (hash(gl_FragCoord.xy) - 0.5) * 0.035;
  outCol += grain;

  gl_FragColor = vec4(clamp(outCol, 0.0, 1.0), 1.0);
}
`;

const VERT_SRC = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

export default function FluidSmokeLab() {
  const { settings } = useDisplay();
  const m = useMotion();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viscosity, setViscosity] = useState<number>(0.5);
  const [timeOfDay, setTimeOfDay] = useState<number>(14); // 2 PM default
  const [interactiveCursor, setInteractiveCursor] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'interactive' | 'agsl' | 'webgl'>('interactive');

  const cursorRef = useRef<{ x: number; y: number; vel: number; lastTime: number }>({
    x: 0.5,
    y: 0.5,
    vel: 0,
    lastTime: 0,
  });
  const scrollRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'high-performance' });
    if (!gl) return;

    const createShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = createShader(gl.VERTEX_SHADER, VERT_SRC);
    const fs = createShader(gl.FRAGMENT_SHADER, FLUID_SMOKE_FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, 'p');
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const loc = {
      uRes: gl.getUniformLocation(prog, 'uRes'),
      uTime: gl.getUniformLocation(prog, 'uTime'),
      uCursor: gl.getUniformLocation(prog, 'uCursor'),
      uCursorVel: gl.getUniformLocation(prog, 'uCursorVel'),
      uScroll: gl.getUniformLocation(prog, 'uScroll'),
      uTimeOfDay: gl.getUniformLocation(prog, 'uTimeOfDay'),
      uViscosity: gl.getUniformLocation(prog, 'uViscosity'),
      uDark: gl.getUniformLocation(prog, 'uDark'),
      uBg: gl.getUniformLocation(prog, 'uBg'),
      uC: [
        gl.getUniformLocation(prog, 'uC[0]'),
        gl.getUniformLocation(prog, 'uC[1]'),
        gl.getUniformLocation(prog, 'uC[2]'),
        gl.getUniformLocation(prog, 'uC[3]'),
        gl.getUniformLocation(prog, 'uC[4]'),
        gl.getUniformLocation(prog, 'uC[5]'),
      ],
    };

    let animId = 0;
    const startTime = performance.now();

    const render = () => {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.useProgram(prog);

      const elapsed = m.scale === 0 ? 0 : (performance.now() - startTime) / 1000;
      gl.uniform1f(loc.uTime, elapsed);
      gl.uniform2f(loc.uRes, width, height);
      gl.uniform2f(loc.uCursor, cursorRef.current.x, cursorRef.current.y);
      gl.uniform1f(loc.uCursorVel, cursorRef.current.vel);
      gl.uniform1f(loc.uScroll, scrollRef.current);
      gl.uniform1f(loc.uTimeOfDay, timeOfDay);
      gl.uniform1f(loc.uViscosity, viscosity);
      gl.uniform1f(loc.uDark, settings.light ? 0 : 1);

      // Canvas background
      gl.uniform3f(loc.uBg, settings.light ? 0.95 : 0.04, settings.light ? 0.95 : 0.04, settings.light ? 0.97 : 0.06);

      // Default palette for current skin
      gl.uniform3f(loc.uC[0]!, 0.0, 0.95, 1.0); // cyan
      gl.uniform3f(loc.uC[1]!, 0.1, 0.6, 0.95);
      gl.uniform3f(loc.uC[2]!, 0.35, 0.5, 0.98);
      gl.uniform3f(loc.uC[3]!, 0.5, 0.45, 0.95);
      gl.uniform3f(loc.uC[4]!, 0.25, 0.85, 0.85);
      gl.uniform3f(loc.uC[5]!, 0.65, 0.75, 0.98);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Slowly decay cursor velocity
      cursorRef.current.vel *= 0.93;

      if (m.scale !== 0) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [m.scale, viscosity, timeOfDay, settings.light]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactiveCursor || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height; // invert for GL

    const now = performance.now();
    const dt = Math.max(1, now - cursorRef.current.lastTime);
    const dist = Math.hypot(x - cursorRef.current.x, y - cursorRef.current.y);
    const speed = Math.min(2.5, (dist / dt) * 45);

    cursorRef.current = { x, y, vel: speed, lastTime: now };
  };

  const AGSL_COMPOSE_SNIPPET = `// Android AGSL (Android 13+ / API 33+) in Jetpack Compose
import android.graphics.RuntimeShader
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawWithCache
import androidx.compose.ui.graphics.ShaderBrush

private const val FLUID_SMOKE_AGSL = """
    uniform float2 iResolution;
    uniform float  iTime;
    uniform float2 iCursor;
    uniform float  iScroll;
    uniform float  iTimeOfDay;
    uniform half4  uColorPrimary;
    uniform half4  uColorSecondary;

    float hash(float2 p) {
        float3 q = fract(float3(p.xyx) * 0.1031);
        q += dot(q, q.yzx + 33.33);
        return fract((q.x + q.y) * q.z);
    }

    float noise(float2 p) {
        float2 i = floor(p);
        float2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + float2(1,0)), f.x),
                   mix(hash(i + float2(0,1)), hash(i + float2(1,1)), f.x), f.y);
    }

    float fbm(float2 p) {
        float v = 0.0;
        float a = 0.5;
        float2x2 m = float2x2(1.6, 1.2, -1.2, 1.6);
        for (int i = 0; i < 4; i++) {
            v += a * noise(p);
            p = m * p;
            a *= 0.5;
        }
        return v;
    }

    half4 main(float2 fragCoord) {
        float2 uv = fragCoord / iResolution;
        float aspect = iResolution.x / iResolution.y;
        float2 p = (uv - 0.5) * float2(aspect, 1.0) * 2.2;
        p.y += iScroll * 0.0018;

        float t = iTime * 0.35;
        float2 q = float2(fbm(p * 1.4 + float2(t * 0.2, -t * 0.15)),
                          fbm(p * 1.4 + float2(-t * 0.18, t * 0.22)));
        float smoke = fbm(p + 2.5 * q);

        half4 color = mix(uColorPrimary, uColorSecondary, smoke);
        return color * smoothstep(0.2, 0.8, smoke);
    }
"""

@RequiresApi(Build.VERSION_CODES.TIRAMISU)
fun Modifier.fluidSmokeBackground(
    time: Float,
    cursor: Offset,
    scroll: Float,
    timeOfDay: Float
): Modifier = this.drawWithCache {
    val shader = RuntimeShader(FLUID_SMOKE_AGSL).apply {
        setFloatUniform("iResolution", size.width, size.height)
        setFloatUniform("iTime", time)
        setFloatUniform("iCursor", cursor.x, cursor.y)
        setFloatUniform("iScroll", scroll)
        setFloatUniform("iTimeOfDay", timeOfDay)
        setColorUniform("uColorPrimary", android.graphics.Color.parseColor("#00F2FE"))
        setColorUniform("uColorSecondary", android.graphics.Color.parseColor("#3B82F6"))
    }
    val brush = ShaderBrush(shader)
    onDrawBehind {
        drawRect(brush = brush)
    }
}`;

  return (
    <main className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col px-7 pb-40 pt-10 sm:pt-14">
      <header className="flex flex-col gap-8 pb-10">
        <Link href="/" className="fw-kicker w-fit text-ink-2 hover:text-ink transition-colors">
          ← Design Lab
        </Link>
        <h1 className="fw-vogue text-[clamp(30px,7vw,64px)] leading-[1.1] text-ink">
          Shader Backgrounds
        </h1>
        <p className="fw-big max-w-[32ch] text-[29px] font-light leading-[1.25] text-ink">
          Live fluid and ink-smoke fields that advect with cursor, scroll, and time of day.
        </p>
        <p className="max-w-[62ch] text-[1.0625rem] font-light leading-[1.5] text-ink-2">
          Pure mathematics in motion: multi-octave curl noise simulating smoke hanging in water.
          On the web, powered by a high-efficiency WebGL fragment shader. On Android, running as a native
          hardware-accelerated AGSL RuntimeShader in Jetpack Compose (Android 13+).
        </p>
      </header>

      {/* Mode Tabs */}
      <div className="flex gap-8 border-b border-[var(--rail)] pb-3">
        {(['interactive', 'agsl', 'webgl'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="fw-kicker text-[12px] transition-colors min-h-[36px]"
            style={{
              color: activeTab === tab ? 'var(--t1)' : 'var(--ink-3)',
              borderBottom: activeTab === tab ? '2px solid var(--t1)' : 'none',
            }}
          >
            {tab === 'interactive' ? '01 · Interactive WebGL Canvas' : tab === 'agsl' ? '02 · Compose AGSL Shader' : '03 · WebGL Fragment Source'}
          </button>
        ))}
      </div>

      {activeTab === 'interactive' && (
        <section className="flex flex-col gap-8 pt-8">
          {/* Interactive Stage */}
          <div
            className="relative h-[480px] w-full overflow-hidden border border-[var(--rail)] cursor-crosshair select-none"
            onPointerMove={handlePointerMove}
          >
            <canvas ref={canvasRef} className="size-full block" />

            <div className="pointer-events-none absolute top-4 left-5 flex items-baseline gap-3 text-[11px] text-ink-3">
              <span className="fw-kicker text-t1 tracking-[2px]">FLUID ADVECTION</span>
              <span className="fw-tabular">
                TIME: {Math.floor(timeOfDay)}:{String(Math.floor((timeOfDay % 1) * 60)).padStart(2, '0')}
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-5 text-[11px] text-ink-3">
              <span>MOVE CURSOR OR SCROLL PAGE TO STIR THE SMOKE PLUMES</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid gap-8 sm:grid-cols-3 border-t border-[var(--rail)]/50 pt-6">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="fw-kicker text-[11px] text-ink-2">Viscosity & Speed</span>
                <span className="fw-tabular text-[12px] text-t1">{Math.round(viscosity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.02"
                value={viscosity}
                onChange={(e) => setViscosity(parseFloat(e.target.value))}
                className="w-full accent-[var(--t1)] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <span className="fw-kicker text-[11px] text-ink-2">Time of Day (Sun Position)</span>
                <span className="fw-tabular text-[12px] text-t1">
                  {Math.floor(timeOfDay)}:00 ({timeOfDay < 6 ? 'Night' : timeOfDay < 12 ? 'Dawn' : timeOfDay < 18 ? 'Noon' : 'Dusk'})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
                className="w-full accent-[var(--t1)] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <span className="fw-kicker text-[11px] text-ink-2">Cursor Reaction</span>
              <button
                type="button"
                onClick={() => setInteractiveCursor((v) => !v)}
                className="fw-big text-[15px] font-light text-left text-ink hover:text-t1 transition-colors min-h-[36px]"
              >
                {interactiveCursor ? '● PUSHING FLUID ON HOVER' : '○ PASSIVE DRIFT'}
              </button>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'agsl' && (
        <section className="flex flex-col gap-4 pt-8">
          <div className="flex items-baseline justify-between">
            <span className="fw-kicker text-t1">Android 13+ Compose Implementation</span>
            <span className="fw-tabular text-[12px] text-ink-3">RuntimeShader &bull; GraphicsLayer</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[13px] font-mono leading-[1.6] text-ink-2 border border-[var(--rail)] bg-[var(--canvas)] select-all">
            {AGSL_COMPOSE_SNIPPET}
          </pre>
        </section>
      )}

      {activeTab === 'webgl' && (
        <section className="flex flex-col gap-4 pt-8">
          <div className="flex items-baseline justify-between">
            <span className="fw-kicker text-t1">WebGL GLSL ES Fragment Shader</span>
            <span className="fw-tabular text-[12px] text-ink-3">2-Pass Advection FBM</span>
          </div>
          <pre className="overflow-x-auto p-5 text-[12px] font-mono leading-[1.5] text-ink-2 border border-[var(--rail)] bg-[var(--canvas)] select-all">
            {FLUID_SMOKE_FRAG}
          </pre>
        </section>
      )}
    </main>
  );
}
