/**
 * File: src/lib/dots/source.ts
 * Description: Samples a Design Lab WebGL background (marble, aurora, ink ...) into a coarse grid of colours by
 * rendering the engine's own shader straight onto a canvas that is only cols x rows pixels: every pixel is one cell,
 * so the pixelation is exact and cheap. Browser only (WebGL); the shaders are the ones in lib/display/background.
 */
import { SOURCES, fragmentFor } from '@/lib/display/background/shaders';
import { MAX_STARS } from '@/lib/display/background/engines';

const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';
const UNIFORMS = ['uRes', 'uTime', 'uDark', 'uS', 'uSat', 'uAmp', 'uPage', 'uBg', 'uC[0]', 'uStarA[0]', 'uStarB[0]', 'uNova[0]', 'uClA', 'uClB'];

export interface SourcePalette {
  id: string;
  name: string;
  /** Six colours, dark to light as the shaders' ramp expects. */
  colours: string[];
  /** 1 = lights on a dark page, 0 = pigment on a light one. */
  dark: 0 | 1;
}

export const SOURCE_PALETTES: SourcePalette[] = [
  { id: 'green', name: 'Greens', colours: ['#1f6b3a', '#2f8f4f', '#4caf68', '#7cc78a', '#a8dcab', '#c9ecc2'], dark: 1 },
  { id: 'clouds', name: 'Cloud greys', colours: ['#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6'], dark: 0 },
  { id: 'sunset', name: 'Sunset', colours: ['#3b1c4a', '#7a2e6e', '#c2416b', '#ef6b4a', '#f7a24b', '#fde08a'], dark: 1 },
  { id: 'ocean', name: 'Ocean', colours: ['#06283d', '#0b4f6c', '#1479a2', '#1fa2c4', '#6cd0e0', '#c4f1f5'], dark: 1 },
  { id: 'navy', name: 'Navy', colours: ['#0b1430', '#16295c', '#23428f', '#3b66c4', '#6f9bea', '#bcd3fb'], dark: 1 },
];

const hexRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
};

export interface Sampler {
  /** Returns cols x rows RGBA bytes (row 0 = top), or null when WebGL or the engine is unavailable. */
  sample(engine: string, cols: number, rows: number, palette: SourcePalette, time: number, strength: number): Uint8Array | null;
  dispose(): void;
}

export function createSampler(): Sampler {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true, antialias: false, alpha: false }) as WebGLRenderingContext | null;
  const progs = new Map<string, { prog: WebGLProgram; loc: Record<string, WebGLUniformLocation | null> } | null>();

  const compile = (type: number, src: string) => {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null;
  };
  const prog = (id: string) => {
    if (progs.has(id)) return progs.get(id) ?? null;
    let out = null;
    const frag = fragmentFor(id);
    if (frag && gl) {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      const fs = compile(gl.FRAGMENT_SHADER, frag);
      if (vs && fs) {
        const p = gl.createProgram()!;
        gl.attachShader(p, vs);
        gl.attachShader(p, fs);
        gl.bindAttribLocation(p, 0, 'p');
        gl.linkProgram(p);
        if (gl.getProgramParameter(p, gl.LINK_STATUS)) {
          const loc: Record<string, WebGLUniformLocation | null> = {};
          UNIFORMS.forEach((n) => (loc[n] = gl.getUniformLocation(p, n)));
          out = { prog: p, loc };
        }
      }
    }
    progs.set(id, out);
    return out;
  };

  if (gl) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }

  const starA = new Float32Array(MAX_STARS * 4);
  const starB = new Float32Array(MAX_STARS * 4);
  for (let i = 0; i < MAX_STARS; i++) {
    starA.set([0, 0, -1, 0], i * 4);
    starB.set([-1, 0, -99, -99], i * 4);
  }
  const nova = new Float32Array(12);
  for (let i = 0; i < 3; i++) nova.set([0, 0, -1, 0], i * 4);

  return {
    sample(engine, cols, rows, palette, time, strength) {
      if (!gl) return null;
      const p = prog(engine);
      if (!p) return null;
      if (canvas.width !== cols || canvas.height !== rows) {
        canvas.width = cols;
        canvas.height = rows;
      }
      gl.viewport(0, 0, cols, rows);
      gl.useProgram(p.prog);
      const L = p.loc;
      const gain = SOURCES[engine]?.gain ?? 1;
      gl.uniform2f(L.uRes, cols, rows);
      gl.uniform1f(L.uTime, time);
      gl.uniform1f(L.uDark, palette.dark);
      gl.uniform1f(L.uS, strength * gain);
      gl.uniform1f(L.uSat, 1);
      gl.uniform1f(L.uAmp, 1);
      gl.uniform1f(L.uPage, 0);
      const bg = hexRgb(palette.colours[0]);
      gl.uniform3f(L.uBg, bg[0], bg[1], bg[2]);
      gl.uniform3fv(L['uC[0]'], new Float32Array(palette.colours.flatMap(hexRgb)));
      if (L['uStarA[0]']) gl.uniform4fv(L['uStarA[0]'], starA);
      if (L['uStarB[0]']) gl.uniform4fv(L['uStarB[0]'], starB);
      if (L['uNova[0]']) gl.uniform4fv(L['uNova[0]'], nova);
      if (L.uClA) gl.uniform4f(L.uClA, 0, 0, 0, 0);
      if (L.uClB) gl.uniform4f(L.uClB, 0, 0, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      const raw = new Uint8Array(cols * rows * 4);
      gl.readPixels(0, 0, cols, rows, gl.RGBA, gl.UNSIGNED_BYTE, raw);
      // WebGL's first row is the bottom one; flip so row 0 is the top.
      const out = new Uint8Array(raw.length);
      for (let y = 0; y < rows; y++) out.set(raw.subarray((rows - 1 - y) * cols * 4, (rows - y) * cols * 4), y * cols * 4);
      return out;
    },
    dispose() {
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}

/** Any image (or other drawable) shrunk to cols x rows with a cover fit: the pixelated version of a picture. */
export function sampleImage(img: CanvasImageSource & { width: number; height: number }, cols: number, rows: number): Uint8ClampedArray {
  const c = document.createElement('canvas');
  c.width = cols;
  c.height = rows;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  const k = Math.max(cols / img.width, rows / img.height);
  const w = img.width * k;
  const h = img.height * k;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
  return ctx.getImageData(0, 0, cols, rows).data;
}
