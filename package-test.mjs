// Đóng gói HTML tự chứa để thử trên máy tính không cần npm hoặc máy chủ.
import fs from 'node:fs';
import path from 'node:path';
let html = fs.readFileSync('dist/index.html', 'utf8');
html = html.replace('<html lang="vi">', '<html lang="vi" data-offline-test="true">');
html = html.replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = fs.readFileSync(path.join('dist', src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});
html = html.replace(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,
  (_, src) => `<style>${fs.readFileSync(path.join('dist', src), 'utf8')}</style>`);
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '');
fs.writeFileSync('../game-hoan-thien-v3.html', html);
