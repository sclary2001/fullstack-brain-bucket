import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, normalizeItem } from './app.js';

test('normalizeItem trims fields and applies complete item defaults', () => {
  const result = normalizeItem({ name: ' Bath towels ', category: ' Linen ' });
  assert.deepEqual(result.item, { name: 'Bath towels', category: 'Linen', quantity: 1, location: '', notes: '' });
});

test('normalizeItem validates required fields and quantity', () => {
  assert.match(normalizeItem({ name: 'Towels' }).error, /category is required/);
  assert.match(normalizeItem({ name: 'Towels', category: 'Linen', quantity: -1 }).error, /whole number/);
  assert.match(normalizeItem({ name: 'Towels', category: 'Linen', quantity: 1.5 }).error, /whole number/);
  assert.match(normalizeItem({ name: 'Towels', category: 'Linen', owner: 'admin' }).error, /unsupported/);
});

test('PATCH accepts selected fields and rejects an empty update', () => {
  assert.deepEqual(normalizeItem({ notes: 'Keep on floor two' }, true).item, { notes: 'Keep on floor two' });
  assert.match(normalizeItem({}, true).error, /at least one/);
});

let server;
let origin;
before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('HTTP app serves the HOTEL frontend and health endpoint', async () => {
  const page = await fetch(origin);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Pick a game/);
  const health = await fetch(`${origin}/api/health`);
  assert.deepEqual(await health.json(), { status: 'ok' });
});

test('HTTP app rejects invalid IDs and invalid create requests before database access', async () => {
  const getOne = await fetch(`${origin}/api/items/not-an-id`);
  assert.equal(getOne.status, 400);
  const create = await fetch(`${origin}/api/items`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: '' }),
  });
  assert.equal(create.status, 400);
  assert.match((await create.json()).error, /category is required|name is required/);
});
