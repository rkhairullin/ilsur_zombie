import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStaticHandler } from '../scripts/serve.js';
import { fileURLToPath } from 'node:url';
const handle = createStaticHandler(fileURLToPath(new URL('../', import.meta.url)));
async function request(url, method = 'GET') {
  const response = { writeHead(status, headers = {}) { this.status = status; this.headers = headers; }, end(body) { this.body = body; } };
  await handle({ url, method }, response);
  return response;
}
test('serves HTML, CSS and JS with correct browser MIME types', async () => {
  for (const [path, type] of [['/', 'text/html'], ['/src/main.js', 'text/javascript'], ['/src/style.css', 'text/css']]) {
    const response = await request(path);
    assert.equal(response.status, 200);
    assert.ok(response.headers['Content-Type'].startsWith(type));
    assert.ok(response.body.length > 0);
  }
});
test('rejects non-public files, traversal and malformed paths', async () => {
  for (const path of ['/package.json', '/.env', '/src/%2e%2e%2fREADME.md', '/missing', '/src/.secret']) assert.equal((await request(path)).status, 404);
  assert.equal((await request('/%E0%A4%A')).status, 400);
  assert.equal((await request('/', 'POST')).status, 405);
  assert.equal((await request('/', 'HEAD')).body, undefined);
});
