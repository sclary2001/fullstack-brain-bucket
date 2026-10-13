import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeMongo, connectMongo, getCollection } from './mongo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDirectory = join(__dirname, '../public');
const editableFields = ['name', 'category', 'quantity', 'location', 'notes'];

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeItem(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Request body must be a JSON object.' };
  }
  if (Object.keys(input).some((field) => !editableFields.includes(field))) {
    return { error: 'Request contains an unsupported item field.' };
  }
  const item = {};
  for (const field of editableFields) {
    if (!Object.hasOwn(input, field)) continue;
    if (field === 'quantity') {
      if (!Number.isInteger(input.quantity) || input.quantity < 0) return { error: 'quantity must be a whole number of zero or more.' };
      item.quantity = input.quantity;
    } else {
      if (typeof input[field] !== 'string') return { error: `${field} must be a string.` };
      item[field] = input[field].trim();
    }
  }
  const limits = { name: 100, category: 60, location: 80, notes: 500 };
  for (const [field, limit] of Object.entries(limits)) {
    if (item[field] !== undefined && item[field].length > limit) return { error: `${field} must be ${limit} characters or fewer.` };
  }
  if (Object.keys(item).length === 0) return { error: 'Provide at least one editable item field.' };
  if (!partial) {
    if (!item.name) return { error: 'name is required.' };
    if (!item.category) return { error: 'category is required.' };
    item.quantity ??= 1;
    item.location ??= '';
    item.notes ??= '';
  }
  if (item.name !== undefined && !item.name) return { error: 'name cannot be empty.' };
  if (item.category !== undefined && !item.category) return { error: 'category cannot be empty.' };
  return { item };
}

function validId(value) {
  return ObjectId.isValid(value) && String(new ObjectId(value)) === value;
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '32kb' }));
  app.use(express.static(publicDirectory));
  app.get('/', (_request, response) => response.sendFile(join(publicDirectory, 'hotel.html')));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.get('/api/hello', (_request, response) => response.json({ message: 'HOTEL API is ready.', success: true }));

  // GET /api/items?category=Linens&q=towel
  app.get('/api/items', async (request, response, next) => {
    try {
      const filter = {};
      if (request.query.category) filter.category = String(request.query.category).slice(0, 60);
      if (request.query.q) filter.name = { $regex: escapeRegex(String(request.query.q).slice(0, 80)), $options: 'i' };
      response.json(await getCollection().find(filter).sort({ name: 1 }).toArray());
    } catch (error) { next(error); }
  });

  // GET /api/items/:id
  app.get('/api/items/:id', async (request, response, next) => {
    try {
      if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid item id.' });
      const item = await getCollection().findOne({ _id: new ObjectId(request.params.id) });
      if (!item) return response.status(404).json({ error: 'Item not found.' });
      response.json(item);
    } catch (error) { next(error); }
  });

  // POST /api/items
  app.post('/api/items', async (request, response, next) => {
    try {
      const result = normalizeItem(request.body);
      if (result.error) return response.status(400).json({ error: result.error });
      const now = new Date();
      const document = { ...result.item, createdAt: now, updatedAt: now };
      const inserted = await getCollection().insertOne(document);
      response.status(201).json({ ...document, _id: inserted.insertedId });
    } catch (error) { next(error); }
  });

  // PATCH /api/items/:id
  app.patch('/api/items/:id', async (request, response, next) => {
    try {
      if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid item id.' });
      const result = normalizeItem(request.body, true);
      if (result.error) return response.status(400).json({ error: result.error });
      const items = getCollection();
      const id = new ObjectId(request.params.id);
      const existing = await items.findOne({ _id: id });
      if (!existing) return response.status(404).json({ error: 'Item not found.' });
      await items.updateOne({ _id: id }, { $set: { ...result.item, updatedAt: new Date() } });
      response.json(await items.findOne({ _id: id }));
    } catch (error) { next(error); }
  });

  // DELETE /api/items/:id
  app.delete('/api/items/:id', async (request, response, next) => {
    try {
      if (!validId(request.params.id)) return response.status(400).json({ error: 'Invalid item id.' });
      const result = await getCollection().deleteOne({ _id: new ObjectId(request.params.id) });
      if (!result.deletedCount) return response.status(404).json({ error: 'Item not found.' });
      response.status(204).end();
    } catch (error) { next(error); }
  });

  // Keep the prior coursework endpoints available.
  app.post('/api/students', (request, response) => response.json({ received: request.body }));
  app.post('/api/create-account', async (request, response, next) => {
    try {
      const { username, email, password } = request.body || {};
      if (![username, email, password].every((value) => typeof value === 'string' && value.trim())) {
        return response.status(400).json({ error: 'username, email, and password are required.' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await getCollection('users').insertOne({ username: username.trim(), email: email.trim(), passwordHash, role: 'user' });
      response.status(201).json({ insertedId: result.insertedId, username: username.trim(), email: email.trim() });
    } catch (error) { next(error); }
  });

  app.use('/api', (_request, response) => response.status(404).json({ error: 'API route not found.' }));
  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: 'Unexpected server error.' });
  });
  return app;
}

export async function start() {
  await connectMongo();
  const port = Number(process.env.PORT) || 5500;
  const server = createApp().listen(port, () => console.log(`HOTEL listening on port ${port}`));
  const shutdown = () => server.close(async () => { await closeMongo(); process.exit(0); });
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  start().catch((error) => { console.error('Unable to start HOTEL:', error.message); process.exit(1); });
}
