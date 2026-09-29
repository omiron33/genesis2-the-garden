#!/usr/bin/env node
/** Standalone renderer for Genesis 2 — The Garden.
 *
 *   node render/render.mjs stills out/stills --times 6,121,262 [--scale .5]
 *   node render/render.mjs video out/film.mp4 [--from 0] [--to 287.57] [--samples 12] [--scale 1]
 *
 * Every frame is a pure function of song time, so any range can be rendered
 * on its own (in parallel) and the pieces joined with ffmpeg's concat demuxer.
 * Motion blur averages evenly spaced sub-frames across a 0.2-frame shutter. */
import path from 'node:path';
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { installGarden } from '../scenes/garden.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [mode, out, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? rest[i + 1] : d; };
if (!['stills', 'video'].includes(mode) || !out) { console.error('usage: render.mjs stills <dir> --times a,b | video <file.mp4> [--from s] [--to s] [--samples n] [--scale x]'); process.exit(1); }

const project = JSON.parse(await readFile(path.join(root, 'project.json'), 'utf8'));
for (const asset of Object.values(project.assets)) if (asset.type === 'font') GlobalFonts.registerFromPath(path.join(root, asset.src), asset.family);
let style; installGarden((id, s) => { style = s; });

const scale = Number(opt('--scale', mode === 'stills' ? .5 : 1)), W = Math.round(1920 * scale / 2) * 2, H = Math.round(1080 * scale / 2) * 2;
const canvas = createCanvas(W, H), ctx = canvas.getContext('2d'), fps = project.fps;
const starts = project.sections.map(s => Math.round(s.start * fps));

function draw(t) {
  const frame = Math.round(t * fps);
  let i = starts.length - 1; while (i > 0 && starts[i] > frame) i--;
  const e = { p: project, s: project.sections[i], t };
  ctx.setTransform(W / 1920, 0, 0, H / 1080, 0, 0); ctx.clearRect(0, 0, 1920, 1080);
  style.background(ctx, e); style.typography(ctx, e);
  return ctx.getImageData(0, 0, W, H).data;
}
function frameAt(frame, samples, shutter = .2) {
  if (samples <= 1) return draw(frame / fps);
  const sum = new Float32Array(W * H * 4);
  for (let k = 0; k < samples; k++) { const d = draw(Math.max(0, (frame + ((k + .5) / samples - .5) * shutter) / fps)); for (let j = 0; j < sum.length; j++) sum[j] += d[j]; }
  const px = new Uint8ClampedArray(sum.length); for (let j = 0; j < sum.length; j++) px[j] = Math.round(sum[j] / samples);
  return px;
}

if (mode === 'stills') {
  await mkdir(out, { recursive: true });
  for (const t of opt('--times', '6').split(',').map(Number)) { draw(t); await writeFile(path.join(out, `${t.toFixed(2).padStart(7, '0')}.png`), await canvas.encode('png')); }
} else {
  const from = Math.round(Number(opt('--from', 0)) * fps), to = Math.round(Number(opt('--to', project.duration)) * fps), samples = Number(opt('--samples', 12));
  await mkdir(path.dirname(path.resolve(out)), { recursive: true });
  const audio = path.join(root, project.audio.src);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(fps), '-i', 'pipe:0',
    '-ss', String(from / fps), '-t', String((to - from) / fps), '-i', audio, '-map', '0:v', '-map', '1:a?', '-shortest',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = from; f < to; f++) {
    const px = frameAt(f, samples);
    if (!ff.stdin.write(Buffer.from(px.buffer))) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - from) % (fps * 5) === 0) process.stderr.write(`${((f - from) / (to - from) * 100).toFixed(0)}% `);
  }
  ff.stdin.end(); await new Promise((r, j) => ff.on('close', c => c ? j(new Error('ffmpeg ' + c)) : r()));
  console.log(`\n${out}`);
}
