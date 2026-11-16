import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
export function createStaticHandler(root) {
  const base = resolve(root);
  return async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      const target = resolve(base, '.' + (pathname === '/' ? '/index.html' : pathname));
      const relative = target.slice(base.length + 1);
      const allowed = relative === 'index.html' || relative.startsWith('src' + sep);
      if (!target.startsWith(base + sep) || !allowed || relative.split(sep).some(p => p.startsWith('.'))) {
        res.writeHead(404); res.end('Not found'); return;
      }
      const body = await readFile(target);
      res.writeHead(200, { 'Content-Type': types[extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch (error) {
      res.writeHead(error instanceof URIError ? 400 : 404); res.end('Not found');
    }
  };
}
export function createStaticServer(root) { return createServer(createStaticHandler(root)); }
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const preview = process.argv.includes('--dist');
  const root = fileURLToPath(new URL(preview ? '../dist/' : '../', import.meta.url));
  const port = Number(process.env.PORT || (preview ? 4173 : 5173));
  createStaticServer(root).listen(port, '0.0.0.0', () => console.log(`Ильсур Зомби: http://localhost:${port}\nТелефон в той же Wi-Fi сети: http://<LAN-IP-компьютера>:${port}`));
}
