// Sock drawer API: one file, Express + MongoDB, full CRUD.
import 'dotenv/config';
import express from 'express';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ---------- middleware ----------
app.use(express.json()); // lets us read req.body as JSON
app.use(express.static(join(__dirname, '../public'))); // serves public/index.html and scripts

// ---------- database ----------
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
const socks = client.db('sockdrawer').collection('socks');

// Only keep the fields we expect, so clients can't save random data.
// Notes are not here: they are a log, added one at a time via POST /api/socks/:id/notes.
function cleanSock(body) {
  // tags arrive as "wool, work, gift" and are stored as ['wool', 'work', 'gift']
  const tags = String(body.tags || '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag);
  return {
    title: String(body.title || '').trim(),
    condition: String(body.condition || 'good').trim(),
    tags,
  };
}

// ---------- routes ----------

// CREATE
app.post('/api/socks', async (req, res) => {
  const sock = cleanSock(req.body);
  if (!sock.title) {
    return res.status(400).json({ error: 'title is required' });
  }
  // image is a placeholder for a later lesson
  const newSock = { ...sock, image: '', notes: [] };
  const result = await socks.insertOne(newSock);
  res.status(201).json({ ...newSock, _id: result.insertedId });
});

// READ all (optional search: /api/socks?search=wool matches title or tag)
app.get('/api/socks', async (req, res) => {
  const search = String(req.query.search || '').trim();
  let filter = {};
  if (search) {
    // escape regex characters so the search is plain text, case-insensitive
    const text = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter = { $or: [{ title: text }, { tags: text }] };
  }
  const all = await socks.find(filter).toArray();
  res.json(all);
});

// READ one
app.get('/api/socks/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'invalid id' });
  }
  const sock = await socks.findOne({ _id: new ObjectId(req.params.id) });
  if (!sock) {
    return res.status(404).json({ error: 'sock not found' });
  }
  res.json(sock);
});

// UPDATE
app.put('/api/socks/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'invalid id' });
  }
  const sock = cleanSock(req.body);
  if (!sock.title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const result = await socks.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: sock }
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'sock not found' });
  }
  res.json({ ...sock, _id: req.params.id });
});

// ADD A NOTE: appends { date, text } to the sock's notes log
app.post('/api/socks/:id/notes', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'invalid id' });
  }
  const text = String(req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }
  const note = { date: new Date().toISOString(), text };
  const result = await socks.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $push: { notes: note } }
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ error: 'sock not found' });
  }
  res.status(201).json(note);
});

// DELETE
app.delete('/api/socks/:id', async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'invalid id' });
  }
  const result = await socks.deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'sock not found' });
  }
  res.json({ deleted: req.params.id });
});

// ---------- start ----------
await client.connect();
app.listen(PORT, () => {
  console.log(`Sock drawer running on http://localhost:${PORT}`);
});