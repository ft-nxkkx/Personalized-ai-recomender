// node preview/build.mjs -> preview/dist/pairwise-preview.html (single self-contained file)
import { build } from 'esbuild';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { THEME_BOOT } from './boot.mjs';

mkdirSync('preview/dist', { recursive: true });
await build({
  entryPoints: ['preview/main.tsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  outdir: 'preview/dist',
  jsx: 'automatic',
  loader: { '.woff2': 'dataurl', '.woff': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"', 'process.env.NEXT_PUBLIC_API_URL': '""' },
  logLevel: 'warning',
});
execSync('npx @tailwindcss/cli -i app/globals.css -o preview/dist/tw.css --minify', { stdio: 'inherit' });

const esc = (s) => s.replace(/<\/script/gi, '<\\/script');
const html = `<title>Pairwise AI</title>
<script>${THEME_BOOT}</script>
<style>${readFileSync('preview/dist/main.css', 'utf8')}</style>
<style>${readFileSync('preview/dist/tw.css', 'utf8')}</style>
<div id="root"></div>
<script>${esc(readFileSync('preview/dist/main.js', 'utf8'))}</script>
`;
writeFileSync('preview/dist/pairwise-preview.html', html);
console.log('wrote preview/dist/pairwise-preview.html', (html.length / 1024).toFixed(0), 'KB');
